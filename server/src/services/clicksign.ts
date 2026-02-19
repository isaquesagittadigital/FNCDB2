/**
 * Clicksign API v3 Integration Service
 * 
 * Flow: 
 *  1. Create Envelope
 *  2. Upload Document (PDF as base64)
 *  3. Add Signers (client, consultant, admin)
 *  4. Create Requirements (sign qualifications linking signer → document)
 *  5. Activate Envelope (change status to 'running')
 *  6. Notify Signers
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateFullContractPdf } from './contract-template';

const CLICKSIGN_BASE_URL = 'https://sandbox.clicksign.com/api/v3';

function getHeaders() {
    return {
        'Authorization': process.env.CLICKSIGN_TOKEN || '',
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    };
}

// ─── Helper: Validate CPF digits ─────────────────────────────────────────────
function isValidCpf(digits: string): boolean {
    if (digits.length !== 11) return false;
    // All same digits are invalid
    if (/^(\d)\1{10}$/.test(digits)) return false;
    // Check first verify digit
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 >= 10) d1 = 0;
    if (parseInt(digits[9]) !== d1) return false;
    // Check second verify digit
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 >= 10) d2 = 0;
    if (parseInt(digits[10]) !== d2) return false;
    return true;
}

// ─── Helper: Fix CPF verify digits if invalid ────────────────────────────────
function fixCpfDigits(digits: string): string {
    const base = digits.slice(0, 9);
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(base[i]) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 >= 10) d1 = 0;
    sum = 0;
    const partial = base + d1;
    for (let i = 0; i < 10; i++) sum += parseInt(partial[i]) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 >= 10) d2 = 0;
    return base + d1 + d2;
}

// ─── Helper: Format CPF (validates and fixes if needed) ──────────────────────
function formatCpf(cpf: string): string {
    // Remove non-digits
    let digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) {
        // Validate and fix if needed
        if (!isValidCpf(digits)) {
            console.log(`[Clicksign] CPF ${cpf} is invalid, fixing verify digits...`);
            digits = fixCpfDigits(digits);
            console.log(`[Clicksign] Fixed CPF: ${digits}`);
        }
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    // Return as-is if not 11 digits (might be CNPJ or other)
    return cpf;
}

// ─── Helper: Make API request ────────────────────────────────────────────────
async function clicksignRequest(method: string, path: string, body?: any) {
    const url = `${CLICKSIGN_BASE_URL}${path}`;
    console.log(`[Clicksign] ${method} ${url}`);
    if (body) console.log('[Clicksign] Body:', JSON.stringify(body, null, 2));

    const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();

    if (!res.ok) {
        console.error(`[Clicksign] Error ${res.status}:`, text);
        throw new Error(`Clicksign API error ${res.status}: ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// ─── 1. Create Envelope ────────────────────────────────────────────────────────
export async function createEnvelope(name: string) {
    const body = {
        data: {
            type: 'envelopes',
            attributes: {
                name,
                locale: 'pt-BR',
                auto_close: true,
                block_after_refusal: true
            }
        }
    };

    const result = await clicksignRequest('POST', '/envelopes', body);
    console.log('[Clicksign] Envelope created:', result.data?.id);
    return result;
}

// ─── 2. Upload Document (base64 PDF) ────────────────────────────────────────
export async function uploadDocument(envelopeId: string, filename: string, base64Content: string) {
    const body = {
        data: {
            type: 'documents',
            attributes: {
                filename,
                content_base64: `data:application/pdf;base64,${base64Content}`
            }
        }
    };

    const result = await clicksignRequest('POST', `/envelopes/${envelopeId}/documents`, body);
    console.log('[Clicksign] Document uploaded:', result.data?.id);
    return result;
}

// ─── 3. Add Signer ──────────────────────────────────────────────────────────
export async function addSigner(
    envelopeId: string,
    opts: {
        name: string;
        email: string;
        cpf: string;
        birthday?: string;
        phone?: string;
        deliveryMethod?: 'email' | 'whatsapp' | 'sms';
    }
) {
    // Validate birthday - must be in the past
    let birthday = opts.birthday || '1990-01-01';
    try {
        const bDate = new Date(birthday);
        if (isNaN(bDate.getTime()) || bDate > new Date()) {
            console.log(`[Clicksign] Birthday ${birthday} is invalid/future, using fallback`);
            birthday = '1990-01-01';
        }
    } catch {
        birthday = '1990-01-01';
    }

    // Format phone number for Clicksign: 55XXXXXXXXXXX (no +)
    let phoneNumber: string | undefined;
    if (opts.phone) {
        // Strip everything except digits, remove leading country code 55
        let digits = opts.phone.replace(/\D/g, '');
        if (digits.startsWith('55') && digits.length >= 12) {
            digits = digits.substring(2);
        }
        // Must be 10 or 11 digits (DDD + number)
        if (digits.length === 10 || digits.length === 11) {
            phoneNumber = `55${digits}`;
        } else {
            console.warn(`[Clicksign] Phone '${opts.phone}' has ${digits.length} digits, expected 10-11. Skipping phone.`);
        }
    }

    const method = opts.deliveryMethod || 'email';
    const needsPhone = method === 'whatsapp' || method === 'sms';

    // Determine actual delivery: fall back to email if phone method lacks valid number
    let actualMethod = method;
    if (needsPhone && !phoneNumber) {
        console.warn(`[Clicksign] Delivery method is ${method} but no valid phone number provided, falling back to email`);
        actualMethod = 'email';
    }

    const attributes: any = {
        name: opts.name,
        email: opts.email,
        documentation: formatCpf(opts.cpf),
        birthday,
        communicate_events: { signature_request: actualMethod },
        refusable: true
    };

    // Add phone_number only when delivery is via WhatsApp or SMS
    if ((actualMethod === 'whatsapp' || actualMethod === 'sms') && phoneNumber) {
        attributes.phone_number = phoneNumber;
    }

    const body = {
        data: {
            type: 'signers',
            attributes
        }
    };

    console.log(`[Clicksign] Adding signer with delivery method: ${method}${phoneNumber ? `, phone: ${phoneNumber}` : ''}`);
    const result = await clicksignRequest('POST', `/envelopes/${envelopeId}/signers`, body);
    console.log('[Clicksign] Signer added:', result.data?.id, opts.name);
    return result;
}

// ─── 4a. Create Qualification Requirement (defines signer role on document) ──
export async function createQualificationRequirement(
    envelopeId: string,
    documentId: string,
    signerId: string,
    role: string = 'party'
) {
    const body = {
        data: {
            type: 'requirements',
            attributes: {
                action: 'agree',
                role
            },
            relationships: {
                document: {
                    data: { type: 'documents', id: documentId }
                },
                signer: {
                    data: { type: 'signers', id: signerId }
                }
            }
        }
    };

    const result = await clicksignRequest('POST', `/envelopes/${envelopeId}/requirements`, body);
    console.log('[Clicksign] Qualification requirement created:', result.data?.id);
    return result;
}

// ─── 4b. Create Authentication Requirement (defines how signer authenticates) ─
export async function createAuthRequirement(
    envelopeId: string,
    documentId: string,
    signerId: string,
    auth: string = 'email'
) {
    const body = {
        data: {
            type: 'requirements',
            attributes: {
                action: 'provide_evidence',
                auth
            },
            relationships: {
                document: {
                    data: { type: 'documents', id: documentId }
                },
                signer: {
                    data: { type: 'signers', id: signerId }
                }
            }
        }
    };

    const result = await clicksignRequest('POST', `/envelopes/${envelopeId}/requirements`, body);
    console.log('[Clicksign] Auth requirement created:', result.data?.id);
    return result;
}

// ─── 4c. Create all requirements for a signer (qualification + authentication) ─
export async function createSignerRequirements(
    envelopeId: string,
    documentId: string,
    signerId: string,
    role: string = 'party'
) {
    await createQualificationRequirement(envelopeId, documentId, signerId, role);
    await createAuthRequirement(envelopeId, documentId, signerId, 'email');
}

// ─── 5. Activate Envelope (set status to 'running') ─────────────────────────
export async function activateEnvelope(envelopeId: string) {
    const body = {
        data: {
            id: envelopeId,
            type: 'envelopes',
            attributes: {
                status: 'running'
            }
        }
    };

    const result = await clicksignRequest('PATCH', `/envelopes/${envelopeId}`, body);
    console.log('[Clicksign] Envelope activated:', envelopeId);
    return result;
}

// ─── 6. Notify Signers ──────────────────────────────────────────────────────
export async function notifyEnvelopeSigners(envelopeId: string, message?: string) {
    const body = {
        data: {
            type: 'notifications',
            attributes: {
                message: message || 'Você tem um documento para assinar na FNCD Capital.'
            }
        }
    };

    const result = await clicksignRequest('POST', `/envelopes/${envelopeId}/notifications`, body);
    console.log('[Clicksign] Notifications sent for envelope:', envelopeId);
    return result;
}

// ─── 7. Get Envelope Details ─────────────────────────────────────────────────
export async function getEnvelopeDetails(envelopeId: string) {
    const result = await clicksignRequest('GET', `/envelopes/${envelopeId}`);
    return result;
}

// ─── 7b. Get Envelope Documents ──────────────────────────────────────────────
export async function getEnvelopeDocuments(envelopeId: string) {
    const result = await clicksignRequest('GET', `/envelopes/${envelopeId}/documents`);
    return result;
}

// ─── 7c. Download Signed Document (returns PDF buffer) ───────────────────────
export async function downloadSignedDocument(envelopeId: string, documentId: string): Promise<Buffer> {
    const url = `${CLICKSIGN_BASE_URL}/envelopes/${envelopeId}/documents/${documentId}/download`;
    console.log(`[Clicksign] Downloading signed document: ${url}`);

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': process.env.CLICKSIGN_TOKEN || '',
            'Accept': 'application/pdf'
        }
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`[Clicksign] Download error ${res.status}:`, text);
        throw new Error(`Clicksign download error ${res.status}: ${text}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    console.log(`[Clicksign] Document downloaded: ${arrayBuffer.byteLength} bytes`);
    return Buffer.from(arrayBuffer);
}

// ─── 8. Webhook Management ───────────────────────────────────────────────────
export async function createWebhook(url: string) {
    const body = {
        data: {
            type: 'webhooks',
            attributes: {
                url,
                status: 'enabled'
            }
        }
    };

    const result = await clicksignRequest('POST', '/webhooks', body);
    console.log('[Clicksign] Webhook created:', result.data?.id, '→', url);
    return result;
}

export async function listWebhooks() {
    const result = await clicksignRequest('GET', '/webhooks');
    return result;
}

export async function deleteWebhook(webhookId: string) {
    const result = await clicksignRequest('DELETE', `/webhooks/${webhookId}`);
    console.log('[Clicksign] Webhook deleted:', webhookId);
    return result;
}

// ─── Generate Contract PDF ──────────────────────────────────────────────────
export async function generateContractPdf(contractData: {
    contractId: string;
    clientName: string;
    clientCpf: string;
    consultantName: string;
    amount: number;
    rate: number;
    period: number;
    startDate: string;
    productName?: string;
}): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    const drawText = (text: string, size: number, bold = false, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
            x: margin,
            y,
            size,
            font: bold ? fontBold : font,
            color
        });
        y -= size + 8;
    };

    const drawLine = () => {
        page.drawLine({
            start: { x: margin, y: y + 5 },
            end: { x: width - margin, y: y + 5 },
            thickness: 1,
            color: rgb(0, 0.64, 0.69) // #00A3B1
        });
        y -= 15;
    };

    const formatCurrency = (v: number) => {
        return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (d: string) => {
        try {
            const date = new Date(d);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return d;
        }
    };

    // ─── Header ───
    drawText('FNCD CAPITAL LTDA', 18, true, rgb(0, 0.17, 0.29)); // #002B49
    drawText('CONTRATO DE INVESTIMENTO', 14, true, rgb(0, 0.64, 0.69)); // #00A3B1
    y -= 5;
    drawLine();
    y -= 10;

    // ─── Contract Info ───
    drawText(`Contrato N.: ${contractData.contractId}`, 11, true);
    drawText(`Data de Emissao: ${formatDate(contractData.startDate)}`, 10);
    drawText(`Produto: ${contractData.productName || 'FNCD Capital'}`, 10);
    y -= 10;

    // ─── Parties ───
    drawText('PARTES CONTRATANTES', 12, true, rgb(0, 0.17, 0.29));
    drawLine();
    y -= 5;
    drawText('CONTRATANTE (Investidor):', 10, true);
    drawText(`Nome: ${contractData.clientName}`, 10);
    drawText(`CPF/CNPJ: ${contractData.clientCpf}`, 10);
    y -= 10;
    drawText('CONTRATADA:', 10, true);
    drawText('FNCD CAPITAL LTDA', 10);
    drawText('CNPJ: 00.000.000/0001-00', 10);
    y -= 10;
    drawText('CONSULTOR RESPONSAVEL:', 10, true);
    drawText(`Nome: ${contractData.consultantName}`, 10);
    y -= 10;

    // ─── Financial Terms ───
    drawText('CONDICOES FINANCEIRAS', 12, true, rgb(0, 0.17, 0.29));
    drawLine();
    y -= 5;
    drawText(`Valor do Aporte: ${formatCurrency(contractData.amount)}`, 10);
    drawText(`Taxa de Rendimento Mensal: ${contractData.rate}%`, 10);
    drawText(`Periodo do Contrato: ${contractData.period} meses`, 10);
    drawText(`Data de Inicio: ${formatDate(contractData.startDate)}`, 10);
    y -= 10;

    // ─── Terms ───
    drawText('TERMOS E CONDICOES', 12, true, rgb(0, 0.17, 0.29));
    drawLine();
    y -= 5;

    const terms = [
        '1. O presente contrato tem por objeto a aplicacao de recursos financeiros',
        '   conforme as condicoes estabelecidas acima.',
        '2. O rendimento sera creditado mensalmente na conta do investidor.',
        '3. O contrato podera ser rescindido por qualquer das partes mediante',
        '   notificacao com 30 dias de antecedencia.',
        '4. Em caso de resgate antecipado, pode haver penalidade conforme',
        '   regulamento vigente.',
        '5. Este contrato e regido pelas leis da Republica Federativa do Brasil.'
    ];

    terms.forEach(t => drawText(t, 9));
    y -= 20;

    // ─── Signature Section ───
    drawText('ASSINATURAS', 12, true, rgb(0, 0.17, 0.29));
    drawLine();
    y -= 30;

    // Client signature line
    page.drawLine({
        start: { x: margin, y },
        end: { x: margin + 200, y },
        thickness: 0.5,
        color: rgb(0.3, 0.3, 0.3)
    });
    page.drawText(contractData.clientName, {
        x: margin, y: y - 14, size: 9, font: fontBold
    });
    page.drawText('Investidor', {
        x: margin, y: y - 26, size: 8, font, color: rgb(0.4, 0.4, 0.4)
    });

    // Consultant signature line
    page.drawLine({
        start: { x: width - margin - 200, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(0.3, 0.3, 0.3)
    });
    page.drawText(contractData.consultantName, {
        x: width - margin - 200, y: y - 14, size: 9, font: fontBold
    });
    page.drawText('Consultor FNCD Capital', {
        x: width - margin - 200, y: y - 26, size: 8, font, color: rgb(0.4, 0.4, 0.4)
    });

    // ─── Footer ───
    page.drawText('Documento gerado eletronicamente por FNCD Capital', {
        x: margin,
        y: 30,
        size: 7,
        font,
        color: rgb(0.5, 0.5, 0.5)
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}

// ─── Company Representatives (fixed signers) ────────────────────────────────
const COMPANY_REPS = [
    {
        name: 'Carla Castra',
        email: 'isaquephputumuju@gmail.com',
        cpf: '52998224725', // Valid test CPF
        birthday: '1980-05-12'
    },
    {
        name: 'Ricardo Riccin',
        email: 'isaque.putumuju@sagittadigital.com.br',
        cpf: '36178607024', // Valid test CPF
        birthday: '1970-05-12'
    }
];

// ─── Full Flow: Create envelope with contract, signers and activate ─────────
export async function createContractEnvelope(contractData: {
    contractId: string;
    clientName: string;
    clientEmail: string;
    clientCpf: string;
    clientBirthday?: string;
    clientPhone?: string;
    deliveryMethod?: 'email' | 'whatsapp' | 'sms';
    amount: number;
    rate: number;
    period: number;
    startDate: string;
    productName?: string;
    paymentDay?: number;
    // Extra client data for full contract
    clientRg?: string;
    clientRgOrgao?: string;
    clientAddress?: string;
    clientCnpj?: string;
    clientRazaoSocial?: string;
}) {
    try {
        // Step 1: Generate full 17-page contract PDF
        console.log('[Clicksign] Generating full contract PDF (17 pages)...');
        let pdfBase64: string;
        try {
            pdfBase64 = await generateFullContractPdf({
                clientName: contractData.clientName,
                cpf: contractData.clientCpf,
                rg: contractData.clientRg,
                rgOrgao: contractData.clientRgOrgao,
                address: contractData.clientAddress,
                email: contractData.clientEmail,
                cnpj: contractData.clientCnpj,
                razaoSocial: contractData.clientRazaoSocial,
                amount: contractData.amount,
                rate: contractData.rate,
                period: contractData.period,
                paymentDay: contractData.paymentDay || 10,
                startDate: contractData.startDate,
                contractId: contractData.contractId,
            });
            console.log('[Clicksign] Full contract PDF generated successfully');
        } catch (pdfErr) {
            console.error('[Clicksign] Full PDF failed, falling back to simple PDF:', pdfErr);
            pdfBase64 = await generateContractPdf({
                ...contractData,
                consultantName: `${COMPANY_REPS[0].name} / ${COMPANY_REPS[1].name}`
            });
        }

        // Step 2: Create Envelope
        const envelopeName = `Contrato ${contractData.contractId} - ${contractData.clientName}`;
        const envelopeRes = await createEnvelope(envelopeName);
        const envelopeId = envelopeRes.data.id;
        console.log('[Clicksign] Envelope created:', envelopeId);

        // Step 3: Upload Document
        const docRes = await uploadDocument(
            envelopeId,
            `contrato_${contractData.contractId}.pdf`,
            pdfBase64
        );
        const documentId = docRes.data.id;
        console.log('[Clicksign] Document uploaded:', documentId);

        // Step 4: Add Signers (Client + 2 Company Representatives)

        // 4a. Client (dynamic from database)
        console.log(`[Clicksign] Adding client signer: ${contractData.clientName} (${contractData.clientEmail})`);
        const clientSignerRes = await addSigner(envelopeId, {
            name: contractData.clientName,
            email: contractData.clientEmail,
            cpf: contractData.clientCpf,
            birthday: contractData.clientBirthday,
            phone: contractData.clientPhone,
            deliveryMethod: contractData.deliveryMethod || 'email'
        });
        const clientSignerId = clientSignerRes.data.id;
        console.log('[Clicksign] Client signer added:', clientSignerId);

        // 4b. Company Representative 1
        console.log(`[Clicksign] Adding company rep 1: ${COMPANY_REPS[0].name} (${COMPANY_REPS[0].email})`);
        const rep1SignerRes = await addSigner(envelopeId, {
            name: COMPANY_REPS[0].name,
            email: COMPANY_REPS[0].email,
            cpf: COMPANY_REPS[0].cpf,
            birthday: COMPANY_REPS[0].birthday
        });
        const rep1SignerId = rep1SignerRes.data.id;
        console.log('[Clicksign] Rep 1 signer added:', rep1SignerId);

        // 4c. Company Representative 2
        console.log(`[Clicksign] Adding company rep 2: ${COMPANY_REPS[1].name} (${COMPANY_REPS[1].email})`);
        const rep2SignerRes = await addSigner(envelopeId, {
            name: COMPANY_REPS[1].name,
            email: COMPANY_REPS[1].email,
            cpf: COMPANY_REPS[1].cpf,
            birthday: COMPANY_REPS[1].birthday
        });
        const rep2SignerId = rep2SignerRes.data.id;
        console.log('[Clicksign] Rep 2 signer added:', rep2SignerId);

        // Step 5: Create Requirements (qualification + authentication for each signer)
        console.log('[Clicksign] Creating requirements for all 3 signers...');
        await createSignerRequirements(envelopeId, documentId, clientSignerId, 'party');
        await createSignerRequirements(envelopeId, documentId, rep1SignerId, 'party');
        await createSignerRequirements(envelopeId, documentId, rep2SignerId, 'party');

        // Step 6: Activate Envelope
        console.log('[Clicksign] Activating envelope...');
        await activateEnvelope(envelopeId);

        // Step 7: Notify Signers
        console.log('[Clicksign] Notifying all signers...');
        await notifyEnvelopeSigners(envelopeId);

        console.log('[Clicksign] ✅ Full flow completed successfully!');
        return {
            success: true,
            envelopeId,
            documentId,
            signers: {
                client: clientSignerId,
                companyRep1: rep1SignerId,
                companyRep2: rep2SignerId
            }
        };
    } catch (error: any) {
        console.error('[Clicksign] Full flow error:', error);
        throw error;
    }
}
