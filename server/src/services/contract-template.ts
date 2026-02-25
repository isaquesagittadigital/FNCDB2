/**
 * Full 17-page SCP Contract PDF Generator
 * Based on DOC/CONTRATO.pdf template
 */
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export interface ContractData {
    clientName: string;
    cpf: string;
    rg?: string;
    rgOrgao?: string;
    address?: string;
    email: string;
    cnpj?: string;
    razaoSocial?: string;
    amount: number;
    rate: number;
    period: number;
    paymentDay: number;
    reportDay?: number;
    startDate: string;
    contractId?: string;
}

// ─── ABNT Page Layout (A4) ───────────────────────────────────────────────────
// 1cm = 28.35pt
const A4_W = 595.28;  // 21cm
const A4_H = 841.89;  // 29.7cm
const ML = 85;         // margin left:  3cm
const MR = 57;         // margin right: 2cm
const MT = 85;         // margin top:   3cm
const MB = 57;         // margin bottom: 2cm
const TW = A4_W - ML - MR; // text width (~453pt)
const PARA_INDENT = 35;   // paragraph indent: 1.25cm

// ─── Font sizes (ABNT) ──────────────────────────────────────────────────────
const FONT_BODY = 12;       // body text
const FONT_TITLE = 14;      // main titles (bold, centered)
const FONT_HEADING = 12;    // clause headings (bold)
const FONT_NOTE = 10;       // citations, footnotes, captions

// ─── Line spacing ────────────────────────────────────────────────────────────
// 1.5 spacing = font_size * 1.5
const LINE_SPACING_BODY = FONT_BODY * 1.5;   // 18pt
const LINE_SPACING_NOTE = FONT_NOTE * 1.2;   // 12pt (simple)

function formatCurrency(v: number): string {
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateLong(d: string): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const date = new Date(d);
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatDateShort(d: string): string {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${date.getFullYear()}`;
}

function numberToWords(n: number): string {
    const u = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const t1 = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const t2 = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const h = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    if (n === 0) return 'zero';
    if (n === 100) return 'cem';
    const parts: string[] = [];
    if (n >= 1000000) { const m = Math.floor(n / 1000000); parts.push(m === 1 ? 'um milhão' : `${numberToWords(m)} milhões`); n %= 1000000; if (n > 0) parts.push('e'); }
    if (n >= 1000) { const k = Math.floor(n / 1000); parts.push(k === 1 ? 'mil' : `${numberToWords(k)} mil`); n %= 1000; if (n > 0) parts.push('e'); }
    if (n >= 100) { parts.push(h[Math.floor(n / 100)]); n %= 100; if (n > 0) parts.push('e'); }
    if (n >= 10 && n < 20) { parts.push(t1[n - 10]); n = 0; }
    else if (n >= 20) { parts.push(t2[Math.floor(n / 10)]); n %= 10; if (n > 0) parts.push('e'); }
    if (n > 0 && n < 10) parts.push(u[n]);
    return parts.join(' ');
}

class PDFWriter {
    private doc: PDFDocument;
    private page!: PDFPage;
    private font!: PDFFont;
    private fontBold!: PDFFont;
    private y: number = 0;
    private pageNum: number = 0;
    private logoImage: any = null;

    constructor(doc: PDFDocument, font: PDFFont, fontBold: PDFFont) {
        this.doc = doc;
        this.font = font;
        this.fontBold = fontBold;
    }

    setLogo(image: any) {
        this.logoImage = image;
    }

    newPage(): PDFPage {
        this.page = this.doc.addPage([A4_W, A4_H]);
        this.y = A4_H - MT;
        this.pageNum++;
        this.drawHeader();
        return this.page;
    }

    drawHeader() {
        if (!this.logoImage) return;

        // Logo size 
        const drawH = 36;
        const scaleLog = drawH / this.logoImage.height;
        const drawW = this.logoImage.width * scaleLog;

        const text = 'FNCD Capital';
        const textSize = 16;
        const textW = this.fontBold.widthOfTextAtSize(text, textSize);

        const totalW = drawW + 10 + textW;

        // Center the whole block horizontally
        const iconX = ML + (TW - totalW) / 2;
        const iconY = A4_H - 45;

        // Draw PNG Logo
        this.page.drawImage(this.logoImage, {
            x: iconX,
            y: iconY - drawH + 5,
            width: drawW,
            height: drawH,
        });

        // Draw Text next to logo
        this.page.drawText(text, {
            x: iconX + drawW + 10,
            y: iconY - 14,
            size: textSize,
            font: this.fontBold,
            color: rgb(0, 43 / 255, 73 / 255)
        });
    }

    checkSpace(needed: number = 40) {
        if (this.y < MB + needed) this.newPage();
    }

    // ─── ABNT Title: 14pt bold, centered, double spacing after ──────────
    title(text: string, size = FONT_TITLE) {
        this.checkSpace(size + 36);
        const textW = this.fontBold.widthOfTextAtSize(text, size);
        const x = ML + (TW - textW) / 2; // centered
        this.page.drawText(text, { x: Math.max(ML, x), y: this.y, size, font: this.fontBold, color: rgb(0, 0.1, 0.2) });
        this.y -= size * 2; // double space after title
    }

    // ─── ABNT Heading: 12pt bold, left-aligned, 1.5 spacing ─────────────
    heading(text: string, size = FONT_HEADING) {
        this.checkSpace(size + 24);
        this.space(LINE_SPACING_BODY * 0.5); // space before heading
        this.page.drawText(text, { x: ML, y: this.y, size, font: this.fontBold });
        this.y -= LINE_SPACING_BODY;
    }

    // ─── ABNT Body text: 12pt, justified, 1.5 spacing, 1.25cm indent ────
    text(text: string, size = FONT_BODY, bold = false, indent = 0) {
        const f = bold ? this.fontBold : this.font;
        // Apply ABNT paragraph indent on first line
        const firstLineIndent = PARA_INDENT + indent;
        const normalIndent = indent;
        const maxWFirst = TW - firstLineIndent;
        const maxW = TW - normalIndent;
        const words = text.split(' ');
        const lineSpacing = size === FONT_NOTE ? LINE_SPACING_NOTE : LINE_SPACING_BODY;

        // Build lines with word-wrap
        const lines: { words: string[]; isLast: boolean; isFirst: boolean }[] = [];
        let currentWords: string[] = [];
        let isFirstLine = true;

        for (const word of words) {
            const testLine = currentWords.length > 0 ? [...currentWords, word].join(' ') : word;
            const curMaxW = isFirstLine ? maxWFirst : maxW;
            const w = f.widthOfTextAtSize(testLine, size);
            if (w > curMaxW && currentWords.length > 0) {
                lines.push({ words: [...currentWords], isLast: false, isFirst: isFirstLine });
                currentWords = [word];
                isFirstLine = false;
            } else {
                currentWords.push(word);
            }
        }
        if (currentWords.length > 0) {
            lines.push({ words: currentWords, isLast: true, isFirst: isFirstLine });
        }

        // Draw lines with justification (ABNT: justified alignment)
        for (const lineData of lines) {
            this.checkSpace(size + 4);
            const lineIndent = lineData.isFirst ? firstLineIndent : normalIndent;
            const lineMaxW = lineData.isFirst ? maxWFirst : maxW;

            if (!lineData.isLast && lineData.words.length > 1) {
                this.drawJustifiedLine(lineData.words, ML + lineIndent, this.y, lineMaxW, size, f);
            } else {
                this.page.drawText(lineData.words.join(' '), { x: ML + lineIndent, y: this.y, size, font: f });
            }
            this.y -= lineSpacing;
        }
    }

    // ─── ABNT Note/Citation: 10pt, simple spacing, 4cm indent ───────────
    note(text: string, bold = false) {
        this.text(text, FONT_NOTE, bold, 113); // 4cm = 113pt additional indent
    }

    private drawJustifiedLine(words: string[], x: number, y: number, maxW: number, size: number, font: PDFFont) {
        if (words.length === 1) {
            this.page.drawText(words[0], { x, y, size, font });
            return;
        }

        let totalWordWidth = 0;
        for (const word of words) {
            totalWordWidth += font.widthOfTextAtSize(word, size);
        }

        const totalSpaceNeeded = maxW - totalWordWidth;
        const spacePerGap = totalSpaceNeeded / (words.length - 1);

        // Cap space to avoid overly stretched text
        const normalSpace = font.widthOfTextAtSize(' ', size);
        const maxSpace = normalSpace * 4;
        const actualSpace = Math.min(spacePerGap, maxSpace);

        let currentX = x;
        for (let i = 0; i < words.length; i++) {
            this.page.drawText(words[i], { x: currentX, y, size, font });
            currentX += font.widthOfTextAtSize(words[i], size) + actualSpace;
        }
    }

    space(h = LINE_SPACING_BODY * 0.5) { this.y -= h; }

    line() {
        this.page.drawLine({ start: { x: ML, y: this.y }, end: { x: A4_W - MR, y: this.y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
        this.y -= 10;
    }

    signatureBlock(name: string, doc: string, docLabel = 'CPF') {
        this.checkSpace(70);
        const lineW = 280;
        const lineX = ML + (TW - lineW) / 2;
        this.page.drawLine({ start: { x: lineX, y: this.y }, end: { x: lineX + lineW, y: this.y }, thickness: 0.5, color: rgb(0.3, 0.3, 0.3) });
        this.y -= LINE_SPACING_BODY;
        const nameText = name.toUpperCase();
        const nameW = this.fontBold.widthOfTextAtSize(nameText, FONT_BODY);
        this.page.drawText(nameText, { x: ML + (TW - nameW) / 2, y: this.y, size: FONT_BODY, font: this.fontBold });
        this.y -= LINE_SPACING_BODY;
        const docText = `${docLabel} ${doc}`;
        const docW = this.font.widthOfTextAtSize(docText, FONT_NOTE);
        this.page.drawText(docText, { x: ML + (TW - docW) / 2, y: this.y, size: FONT_NOTE, font: this.font });
        this.y -= LINE_SPACING_BODY * 1.5;
    }

    // ─── ABNT Cover Page: centered text ─────────────────────────────────
    coverCentered(text: string, size = FONT_BODY, bold = false) {
        const f = bold ? this.fontBold : this.font;
        this.checkSpace(size + 10);
        const textW = f.widthOfTextAtSize(text, size);
        const x = ML + (TW - textW) / 2;
        this.page.drawText(text, { x: Math.max(ML, x), y: this.y, size, font: f });
        this.y -= size * 2;
    }

    getY() { return this.y; }
    setY(v: number) { this.y = v; }
    getPageNum() { return this.pageNum; }
    getPage() { return this.page; }
    getDoc() { return this.doc; }

    // ─── Draw embedded image centered ───────────────────────────────
    async drawImage(imgBytes: Uint8Array, imgWidth: number, imgHeight: number, isPng = true) {
        const image = isPng
            ? await this.doc.embedPng(imgBytes)
            : await this.doc.embedJpg(imgBytes);

        // Scale to fit within text width, maintaining aspect ratio
        const scale = Math.min(TW / imgWidth, 1);
        const drawW = imgWidth * scale;
        const drawH = imgHeight * scale;

        this.checkSpace(drawH + 20);
        const x = ML + (TW - drawW) / 2; // centered
        this.y -= drawH;
        this.page.drawImage(image, {
            x,
            y: this.y,
            width: drawW,
            height: drawH,
        });
        this.y -= LINE_SPACING_BODY;
    }
}

// Fixed company info
const FNCD = {
    name: 'FNCD CAPITAL LTDA',
    cnpj: '56.441.252/0001-00',
    address: 'Avenida Copacabana, 325 – sala 1318 – setor 02 – Dezoito do Forte Empresarial, Alphaville – Barueri/SP – CEP 06472-001',
    rep1: 'CARLA GANDOLFO, empresária, nascida em 06/09/1984, portadora da cédula de identidade nº 30.796.703, inscrita no CPF 318.630.658-22',
    rep2: 'HENRI ALBERTO APONTE, empresário, nascido em 13/06/1989, portador da cédula de identidade nº 39.354.902, inscrito no CPF nº. 368.150.008-85',
    bank: 'Banco Safra 422 | Agência 0034 | Conta 47.993-1 | Titular: FNCD CAPITAL LTDA'
};

export async function generateFullContractPdf(data: ContractData): Promise<string> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const w = new PDFWriter(doc, font, fontBold);

    // Load top logo
    try {
        const logoPath = path.resolve(__dirname, '../../../public/assets/logos/repo-logo.png');
        const logoBytes = fs.readFileSync(logoPath);
        const embeddedLogo = await doc.embedPng(new Uint8Array(logoBytes));
        w.setLogo(embeddedLogo);
    } catch (e) {
        console.warn('[PDF] Could not load logo image:', e);
    }

    // Load signature image for Section 1 only
    let sigImage: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
    let sigDrawW = 0;
    let sigDrawH = 0;
    try {
        const sigPath = path.resolve(__dirname, '../../../DOC/assinaturas.png');
        const sigBytes = fs.readFileSync(sigPath);
        sigImage = await doc.embedPng(new Uint8Array(sigBytes));
        const targetW = TW * 0.55;
        const scale = targetW / sigImage.width;
        sigDrawW = sigImage.width * scale;
        sigDrawH = sigImage.height * scale;
    } catch (e) {
        console.warn('[PDF] Could not load signatures image:', e);
    }

    // Helper: draw FNCD signature WITH image (Section 1 / page 8 only)
    const drawFncdSignatureWithImage = () => {
        if (sigImage) {
            w.checkSpace(sigDrawH + 80);
            const imgX = ML + (TW - sigDrawW) / 2;
            const curY = w.getY();
            w.getPage().drawImage(sigImage, {
                x: imgX,
                y: curY - sigDrawH,
                width: sigDrawW,
                height: sigDrawH,
            });
            w.setY(curY - sigDrawH - 8);
            w.coverCentered('FNCD CAPITAL LTDA', FONT_BODY, true);
            w.coverCentered(`CNPJ ${FNCD.cnpj}`, FONT_BODY, false);
        } else {
            w.signatureBlock(FNCD.name, FNCD.cnpj, 'CNPJ');
        }
    };

    // Helper: draw FNCD signature WITHOUT image (NDA and Termo de Adesão)
    const drawFncdSignature = () => {
        w.signatureBlock(FNCD.name, FNCD.cnpj, 'CNPJ');
    };

    const dateLong = formatDateLong(data.startDate);
    const dateShort = formatDateShort(data.startDate);
    const clientId = data.cnpj || data.cpf;
    const clientLabel = data.cnpj ? 'CNPJ' : 'CPF';
    const clientFullName = data.razaoSocial || data.clientName;
    const clientQualif = data.cnpj
        ? `Pessoa Jurídica: ${clientFullName}, ${clientLabel} ${clientId}, end. ${data.address || 'não informado'} e-mail ${data.email}`
        : `Pessoa Física: ${clientFullName}, ${clientLabel} ${clientId}, RG ${data.rg || 'não informado'}/${data.rgOrgao || 'SSP'}, end. ${data.address || 'não informado'} e-mail ${data.email}`;
    const amountWords = numberToWords(Math.floor(data.amount));
    const amountStr = `${formatCurrency(data.amount)} (${amountWords} reais)`;
    const upsStr = `${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} UPs`;

    // ═══════════════════════════════════════════════════════════════
    // SECTION 1: CONTRATO-BASE SCP (Pages 1-8)
    // ═══════════════════════════════════════════════════════════════
    w.newPage();
    w.title('CONTRATO DE SOCIEDADE EM CONTA DE PARTICIPAÇÃO');
    w.title('FNCD CAPITAL SCP 4T2026', 12);
    w.text(`São Paulo, ${dateLong}.`);
    w.space();
    w.heading('Partes:');
    w.text(`I. ${FNCD.name}, CNPJ ${FNCD.cnpj}, com sede à ${FNCD.address}, neste ato representada por ${FNCD.rep1} e ${FNCD.rep2}, doravante denominada Sócia Ostensiva;`);
    w.space(4);
    w.text('II. Investidores identificados no Quadro Resumo anexo a este ou que aderirem posteriormente através de Termo de Adesão, doravante denominados Sócios Participantes ou Investidores;');
    w.space(4);
    w.text('Têm entre si, justo e contratado, constituir a presente Sociedade em Conta de Participação, a qual será regida pelas disposições legais em vigor e pelas cláusulas contratuais abaixo estipuladas.');
    w.space();

    w.heading('DEFINIÇÕES PRELIMINARES');
    w.text('1.1 SCP: sociedade em conta de participação, regida pelos arts. 991 a 996 do Código Civil.');
    w.text('1.2 Patrimônio Especial: conjunto de bens/direitos/obrigações afetos ao empreendimento da SCP.');
    w.text('1.3 Série/Coorte: grupo de Investidores admitidos em mês/ano específicos, com parâmetros próprios (Anexo A – Suplemento).');
    w.text('1.4 UP – Unidade de Participação: fração econômica contratual do Investidor na Série; emitida sem ágio e pessoal/intransferível salvo autorização da sócia ostensiva.');
    w.text('1.5 Conta Bancária Dedicada da Série: conta bancária de titularidade da Sócia Ostensiva, vinculada à SCP/Série, destinada a aportes, recebimentos e movimentações da Série, com gestão pela Sócia Ostensiva.');
    w.text('1.6 Instituição Autorizada: instituição autorizada pelo Bacen a operar câmbio.');
    w.text('1.7 Integração. Integram este instrumento: Anexos A–E.');
    w.space();

    // Clauses 1-20 (fixed legal text)
    const clauses: [string, string[]][] = [
        ['CLÁUSULA 1 – DA SEDE SOCIAL', [
            `A SCP, exclusivamente para os efeitos de cumprimento das obrigações determinadas neste instrumento, tem sede social no mesmo endereço da sede social da Sócia Ostensiva, localizada à ${FNCD.address}.`
        ]],
        ['CLÁUSULA 2 – NATUREZA JURÍDICA E DESIGNAÇÃO', [
            '2.1 A SCP não possui personalidade jurídica e atua sob o nome da Sócia Ostensiva, que responde perante terceiros; o Sócio Participante não se obriga perante terceiros.',
            '2.2 A responsabilidade interna do Sócio Participante limita-se aos aportes, salvo dolo/fraude.',
            '2.3 Atividades reguladas/privativas serão executadas e liquidadas na Instituição Autorizada; a Sócia Ostensiva poderá atuar como correspondente ou prestadora de serviços auxiliares, na gestão do patrimônio especial da SCP.',
            '2.4 Exclusivamente para os fins e efeitos deste instrumento e no que concerne às relações entre os sócios, a sociedade adotará o nome FNCD CAPITAL LTDA SOCIEDADE EM CONTA DE PARTICIPAÇÃO 4T2025 (FNCD CAPITAL LTDA SCP 4T2025).'
        ]],
        ['CLÁUSULA 3 – OBJETO E PRAZO DE DURAÇÃO', [
            '3.1 O objeto do presente contrato de SCP que as partes pretendem promover, conjuntamente, é a exploração e desenvolvimento de empreendimentos econômicos e gestão patrimonial, incluindo:',
            'a) receitas de serviços ou comissões associadas a operações de câmbio, sempre com execução/liquidação na Instituição Autorizada;',
            'b) receitas de outras atividades lícitas e compatíveis, conforme Suplemento da Série.',
            '3.2 A Captação de investimento é privada. Sendo vedada a oferta pública, tanto pela sócia ostensiva como pelos investidores.',
            '3.3 O prazo de duração da presente sociedade correrá por tempo indeterminado, tendo início na data da assinatura deste contrato.'
        ]],
        ['CLÁUSULA 4 – PATRIMÔNIO ESPECIAL, APORTES E UPs', [
            '4.1 O Patrimônio Especial é composto por aportes dos Investidores e da Sócia Ostensiva (inclusive know-how/estrutura), além dos resultados da atividade.',
            '4.2 Aportes e recebimentos ocorrerão exclusivamente por meio da Conta Bancária Dedicada da Série (dados no Suplemento e Termo de Adesão).',
            '4.3 UPs correspondem ao valor integralizado (vedado ágio); eventuais aportes adicionais seguem critérios do Suplemento (sem diluição retroativa).',
            '4.4 A Sócia Ostensiva aportará recursos/ativos/horas condizentes com sua gestão, e pode haver valoração para efeitos de participação nos resultados.',
            '4.5 Rastreabilidade: A sócia ostensiva fará a conciliação contábil por Série, guarda de documentos e extratos mensais por 5 anos (ou prazo legal se superior).',
            '4.6 As partes optam por não constituir um Capital Social neste ato. O mesmo irá seguir conforme o Patrimônio Especial evoluir através da adesão dos sócios investidores.',
            '4.7 A sócia ostensiva integraliza neste ato sua participação no Patrimônio Especial em moeda corrente e com a cessão de know-how, estrutura física e recursos humanos.',
            '4.8 Os sócios Investidores integralizarão suas unidades de participação respectivas aos seus aportes conforme termo de adesão.'
        ]],
        ['CLÁUSULA 5 – SÉRIES/COORTES, SUPLEMENTO E INDEPENDÊNCIA ECONÔMICA', [
            '5.1 A admissão nesta Série é parametrizada por seu Suplemento (Anexo A).',
            '5.2 Cada Série tem autonomia econômica para apuração e distribuição, estando o investidor apenas vinculado à série e SCP a qual ingressou por meio do termo de adesão assinado.',
            '5.3 Encerrada a Série, aplica-se o procedimento de cash sweep e destinação final de saldos (Anexo A).'
        ]],
        ['CLÁUSULA 6 – ADMISSÃO DE NOVOS INVESTIDORES', [
            '6.1 A Sócia Ostensiva está autorizada e pode admitir novos Sócios Investidores por Termo de Adesão sem necessidade de anuência ou consentimento dos demais, desde que não haja diluição retroativa nem alteração de direitos consolidados, em linha com o art. 995 CC.',
            '6.2 Requisitos: KYC, Termo de Riscos, comprovação de integralização do aporte na Conta Bancária Dedicada da Série e Termo de Adesão assinado.',
            '6.3 Alterações estruturais no presente contrato dependem de aditivo com anuência dos afetados.'
        ]],
        ['CLÁUSULA 7 – ADMINISTRAÇÃO, DIREITO ESPECIAL E VOTOS', [
            '7.1 A administração da Sociedade será exercida pela Sócia Ostensiva que representará legalmente a Sociedade, ativa e passivamente, judicial e extrajudicial e poderá praticar todo e qualquer ato de gestão.',
            '7.2 A gestão será exclusiva da Sócia Ostensiva, com poderes para contratar terceiros, firmar instrumentos, abrir contas dedicadas, realizar operações de câmbio, transferências, alocação de caixa e praticar atos necessários.',
            '7.3 O exercício da administração pela Sócia Ostensiva será realizado pelo prazo de duração da Sociedade, ou seja, por prazo indeterminado.',
            '7.4 A Sócia Ostensiva terá plenos poderes na operação podendo assinar todos os documentos necessários para a operação da Sociedade, a constituição de procuradores, assim como quaisquer outras decisões, será sempre tomada pelo administrador.',
            '7.5 Direito Especial de Veto da Sócia Ostensiva sobre: (i) operação/gestão; (ii) PLD/FT; (iii) escolha/substituição de Instituição Autorizada e prestadores críticos; (iv) comunicação com investidores; (v) medidas de contingência e liquidação.',
            '7.6 Os Investidores não têm voto/gestão; seus direitos são informacionais e econômicos nos resultados conforme o termo de adesão individual.',
            `7.7 A Administração da Sociedade será exercida pelos representantes da sócia ostensiva, ${FNCD.rep1} e ${FNCD.rep2}, os quais assinarão isoladamente ou em conjunto conforme as diretrizes a seguir e conforme estipulado no Suplemento deste Contrato Base (Anexo A).`,
            '7.7.1 Assinaturas Isoladas',
            'Nos atos e documentos de todo tipo, com valor estipulado até R$ 249.999,99 (duzentos e quarenta e nove mil novecentos e noventa e nove reais e noventa e nove centavos), a Sociedade será legitimamente representada com a assinatura individual dos administradores, sendo consideradas as deliberações em comum.',
            '7.7.2 Assinaturas em Conjunto',
            'Nos atos e documentos de todo tipo, com valor superior a R$ 250.000,00 (duzentos e cinquenta mil reais), a Sociedade apenas será legitimamente representada com a assinatura em Conjunto dos administradores, sendo consideradas as deliberações em comum.',
            '7.8 A administradora declara, sob as penas da lei, que não está impedida de exercer a administração da Sociedade por força de lei especial, em virtude de condenação criminal ou por se encontrar sob os efeitos desta, em pena que vede, ainda que temporariamente, o acesso a cargos públicos, ou por condenação por crime falimentar, prevaricação, peita ou suborno, concussão, peculato, crimes contra a economia popular, o sistema financeiro nacional, as normas de defesa da concorrência, as relações de consumo, a fé pública ou a propriedade.'
        ]],
        ['CLÁUSULA 8 – INFORMAÇÕES, PRESTAÇÃO DE CONTAS E AUDITORIA', [
            '8.1 A sócia ostensiva irá fornecer um relatório trimestral por Série para cada sócio investidor.',
            '8.2 Em caso de solicitação específica de auditoria independente pelo investidor, este arcará com os custos da auditoria que vier a ser contratada para a finalidade solicitada, sem prejuízo da prestação de contas regular.',
            '8.3 Em se tratando de dados sensíveis, e investidores diversos, a Sócia Ostensiva não disponibilizará extratos mensais da Conta Bancária Dedicada da Série aos investidores de forma individual.'
        ]],
        ['CLÁUSULA 9 – CONTA BANCÁRIA DEDICADA E VINCULADA A SÉRIE', [
            `9.1 A Conta Bancária Dedicada da Série é aberta exclusivamente para a SCP/Série, em nome da sócia ostensiva ${FNCD.name}, com gestão livre e exclusiva pela Sócia Ostensiva.`,
            '9.2 Movimentações permitidas: recebimento de aportes e receitas; pagamentos de custos, despesas e tributos; alocações de caixa (Definidos no Suplemento); transferências entre Contas; liquidações cambiais na Instituição Autorizada, entre outras necessárias para a boa gestão livre da Sócia Ostensiva.',
            '9.3 Restrições internas: (i) usar a Conta Bancária Dedicada da Série exclusivamente para a Série; (ii) vedado desvio de finalidade.',
            '9.4 Ocorrendo disponibilidade financeira, o saldo disponível será aplicado e gerido conforme know-how da sócia ostensiva.',
            '9.5 Múltiplas contas ou subcontas poderão ser utilizadas pela sócia ostensiva para operações específicas (p.ex., recebíveis, câmbio), permanecendo a segregação por Série.',
            '9.6 O sócio investidor não possui qualquer gestão sobre a Conta Bancária Dedicada da Série.'
        ]],
        ['CLÁUSULA 10 – RESERVAS E DISTRIBUIÇÕES', [
            '10.1 Ordem de alocação: A Alocação seguirá conforme Anexo A e o Termo de Adesão individual de cada investidor.',
            '10.2 Proibições: adiantamentos de lucro sem lastro e pagamentos fora do fluxo previsto no termo de adesão.',
            '10.3 Distribuições por crédito em conta indicada pelo investidor, com retenções tributárias se cabíveis.',
            '10.4 As distribuições seguirão o previsto no termo de adesão de cada investidor, não sendo vinculadas à porcentagem, mas sim a UP e aporte do investidor.',
            '10.5 A distribuição dos lucros ou resultados poderá ser realizada de forma desproporcional em relação à UP e aportes na sociedade, devendo obedecer ao estipulado no termo de adesão individual de cada investidor.'
        ]],
        ['CLÁUSULA 11 – REMUNERAÇÃO DA SÓCIA OSTENSIVA', [
            '11.1 A remuneração da sócia ostensiva se dará por meio da distribuição de lucro ou resultados, podendo ser realizada de forma desproporcional em relação à UP e aos aportes na sociedade.'
        ]],
        ['CLÁUSULA 12 – DECLARAÇÕES', [
            '12.1 Da Sócia Ostensiva: A sócia ostensiva declara que possui capacidade e poderes de gestão, bem como adotará práticas de PLD/FT. Declara ainda que possuir relação vigente com Instituição Autorizada. Declara que será responsável pela escrituração e entrega das obrigações da SCP (CNPJ, ECD/ECF). E por fim declara a inexistência de impedimentos legais.',
            '12.2 Do Investidor: Conforme o termo de Adesão e documentação, o investidor declara a origem lícita dos recursos, ciência de riscos e ausência de garantia de retorno, o reconhecimento de não ter voto/gestão, e por fim declara a inexistência de impedimentos legais.'
        ]],
        ['CLÁUSULA 13 – EXERCÍCIO SOCIAL, TRIBUTAÇÃO E ESCRITURAÇÃO', [
            '13.1 A SCP terá CNPJ e escrituração própria e segregada por Série, equiparada a pessoa jurídica para fins tributários. Todas as obrigações acessórias serão cumpridas pela Sócia Ostensiva.',
            '13.2 A tributação observará a legislação vigente. Informes serão fornecidos ao Sócio Investidor quando aplicável.',
            '13.3 O exercício social é anual, com demonstrações financeiras ao término e balancetes periódicos para distribuições intermediárias (quando houver), mantendo-se contabilidade específica e conta especial da SCP nos livros da Ostensiva.'
        ]],
        ['CLÁUSULA 14 – TRANSFERÊNCIA DAS UPs', [
            '14.1 Transferências de UPs depende de consentimento da Sócia Ostensiva (com KYC/KYB), devendo sempre ser comunicada anteriormente com prazo não inferior à 30 dias para que ocorra o aceite ou negativa por parte da Sócia Ostensiva. O aceite ou negativa deve ser formal e por escrito não precisando de qualquer justificativa.',
            '14.2 As UPs são indivisíveis e não poderão ser cedidas ou transferidas a terceiros, sob qualquer hipótese, com a exceção em caso de aceite por parte da Sócia Ostensiva.',
            '14.3 O Sócio Investidor não poderá, em qualquer momento durante a vigência deste Contrato, direta ou indiretamente, criar, incorrer, assumir ou permitir a existência de Ônus de qualquer natureza sobre sua participação no patrimônio especial da Sociedade ou seus direitos decorrentes deste Contrato.',
            '14.4 Para os fins deste Contrato, o termo "Ônus" significa qualquer garantia real ou pessoal de qualquer tipo, incluindo, sem limitação, qualquer hipoteca, alienação fiduciária, penhor, caução, usufruto, qualquer tipo de restrição judicial ou administrativa, bem como quaisquer direitos de terceiros, arrendamento, licenciamento, acordo de voto, opção, direito de primeira oferta, direito de preferência, ou quaisquer outras restrições ou limitações de qualquer natureza que possam afetar, restringir ou condicionar a total propriedade e posse de determinado direito, bem ou ativo.'
        ]],
        ['CLÁUSULA 15 – RETIRADA, MORTE, INTERDIÇÃO E LIQUIDAÇÃO DE HAVERES', [
            '15.1 A retirada voluntária observará janelas/eventos de liquidez definidos no Suplemento, e principalmente no Termo de Adesão.',
            '15.2 Em caso de falecimento/interdição/insolvência de Investidor, não se dissolverá a SCP, que prosseguirá com os remanescentes, e será realizada a apuração de haveres por balanço de determinação em até 90 dias, o pagamento seguirá dentro dos prazos do Suplemento e do Termo de Adesão.',
            '15.3 Em caso de Falência da Sócia Ostensiva, ocorrerá a dissolução da SCP e liquidação dos recursos, classificando-se o saldo do investidor como crédito quirografário.'
        ]],
        ['CLÁUSULA 16 – CONFIDENCIALIDADE E PROPRIEDADE INTELECTUAL', [
            '16.1 Informações técnicas/comerciais/estratégicas são confidenciais por 5 anos após o encerramento da Série, dissolução da SCP, ou retirada do sócio investidor.',
            '16.2 Propriedade intelectual (marcas, materiais, softwares, relatórios) pertencem todas à sócia ostensiva, não sendo autorizado o uso pelo sócio investidor para qualquer fins.',
            '16.3 Os sócios se obrigam a manter em sigilo todas as informações relacionadas ao objeto social da sociedade.'
        ]],
        ['CLÁUSULA 17 - PROTEÇÃO DE DADOS', [
            '17.1 Pelo presente instrumento, o Sócio Ostensivo declara que receberá informações relacionadas aos clientes da filial referentes à pessoa natural identificada ou identificável, incluindo, mas não se limitando a nome, Cadastro Nacional de Pessoa Física (CPF), Carteira de Identidade (RG), endereço, e-mail, telefone, dados bancários ("Dados Pessoais"), e, eventualmente, informações que revelam origem racial ou étnica, convicção religiosa, opinião política ou organização de caráter religioso, filosófico ou político, além de dados referentes à saúde, vida sexual, dados genéticos ou biométricos ("Dados Sensíveis") e demais informações que permitam a identificação direta ou indireta do titular.',
            '17.2 Para a operação da Sociedade, em conformidade com a Lei Geral de Proteção de Dados e as determinações de órgãos reguladores e fiscalizadores sobre a matéria, no manuseio de dados dos clientes e fornecedores ("Proteção de Dados"), o Sócio Ostensivo se compromete a:',
            '(i) Tratar os Dados Pessoais e Dados Sensíveis a que tiver acesso como controladora, devendo observar o Anexo B e Políticas Internas;',
            '(ii) Manter e utilizar medidas de segurança administrativas, técnicas e físicas apropriadas e suficientes para proteger a confidencialidade e integridade de todos os dados pessoais mantidos ou consultados/transmitidos eletronicamente, para garantir a proteção desses dados contra acesso não autorizado, destruição, uso modificação, divulgação ou perda acidental ou indevida;',
            '(iii) Acessar os dados dentro de seu escopo e na medida abrangida por sua permissão de acesso (autorização) e que os Dados Pessoais e Dados Sensíveis não podem ser copiados, modificados ou removidos sem autorização expressa e por escrito do Sócio Participante.'
        ]],
        ['CLÁUSULA 18 – COMUNICAÇÕES E NOTIFICAÇÕES', [
            '18.1 Todas as comunicações operacionais devem ser por e-mail, WhatsApp ou Telefone aos endereços e dados cadastrados.',
            '18.2 Todas as Notificações formais serão por e-mail com confirmação de leitura, telegrama, ou carta com aviso de recebimento.'
        ]],
        ['CLÁUSULA 19 – ALTERAÇÕES CONTRATUAIS', [
            '19.1 Este Contrato pode ser alterado por aditivo, conforme a vontade das partes, mantendo o direito de voto, decisão e administração apenas com a sócia ostensiva.'
        ]],
        ['CLÁUSULA 20 – DISPOSIÇÕES FINAIS', [
            '20.1 Tolerância não implica novação/renúncia. Invalidade parcial não afeta o restante (substituição por cláusula de efeito equivalente).',
            '20.2 Invalidade parcial: cláusula inválida será substituída por outra de efeito econômico equivalente.',
            '20.3 Assinaturas Digitais são aceitas em todos os documentos relacionados.',
            '20.4 Fica eleito o Foro Central da Comarca de São Paulo, no Estado de São Paulo, para dirimir quaisquer dúvidas ou litígios que possam eventualmente surgir em decorrência do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
            '20.5 Os sócios declaram ter lido e compreendido todas as cláusulas deste contrato e o acharam em conformidade com suas vontades, pelo que livremente se obrigam a cumpri-lo, por si e por seus sucessores, assinando-o, bem como seus anexos.'
        ]]
    ];

    for (const [title, texts] of clauses) {
        w.heading(title);
        for (const t of texts) w.text(t);
        w.space(4);
    }

    // Annexes list
    w.heading('ANEXOS (parte integrante)');
    w.text('Anexo A — Suplemento da Série 4T2025 (identificação, parâmetros, instituição e Conta Bancária Dedicada da Série, infos fiscais e de relatórios)');
    w.text('Anexo B — Formulário do Investidor (KYC + Termo de Riscos + LGPD)');
    w.text('Anexo C — Termo de Adesão e Subscrição (art. 995 CC; sem voto; sem diluição retroativa)');
    w.text('Anexo D — NDA – Termo de Confidencialidade');
    w.text('Anexo E — Recibo de Integralização e Emissão de UPs');
    w.space();
    w.text(`São Paulo, ${dateLong}.`);
    w.space(LINE_SPACING_BODY * 3);

    // FNCD Signature WITH image (only on Section 1 / page 8)
    drawFncdSignatureWithImage();

    // ═══════════════════════════════════════════════════════════════
    // SECTION 2: NDA (Pages 9-12) - with dynamic client data
    // ═══════════════════════════════════════════════════════════════
    w.newPage();
    w.title('TERMO DE CONFIDENCIALIDADE (NDA) — MULTILATERAL');
    w.text('FNCD CAPITAL SCP | Aplicável a todas as Séries');
    w.space();
    w.heading('Entre:');
    w.text(`(A) ${FNCD.name}, CNPJ ${FNCD.cnpj}, com sede à ${FNCD.address}, neste ato representada por ${FNCD.rep1} e ${FNCD.rep2}, com endereço de e-mail contato@fncd.com.br, doravante denominada "FNCD"; e`);
    w.space(4);
    w.text(`(B) Sócio Investidor ${clientQualif}, doravante denominado "investidor";`);
    w.space(4);
    w.text('Considerando que as Partes pretendem trocar informações para (i) negociar, estruturar e operar Sociedades em Conta de Participação (SCPs) em que a FNCD atuará como Sócia Ostensiva; (ii) executar operações de câmbio via Instituição Autorizada e atividades correlatas; (iii) compartilhar relatórios, parâmetros de Série (Suplemento), dados de Conta Bancária Dedicada, políticas e dados correlatos;');
    w.text('As Partes resolvem firmar o presente Termo de Confidencialidade (NDA):');
    w.space();

    // NDA clauses (fixed text)
    const ndaClauses: [string, string[]][] = [
        ['1. DEFINIÇÕES', [
            '1.1 Informações Confidenciais: toda informação, dado, documento, material, relatório, contrato, especificação técnica, comercial, financeira, jurídica, operacional, de TI/segurança, dados pessoais (conforme LGPD), parâmetros de Séries, planilhas, endereços/credenciais bancárias da Conta Dedicada, listas de investidores/fornecedores, comunicações e quaisquer cópias/derivados, em qualquer mídia, marcada ou não como confidencial.',
            '1.2 Representantes: administradores, empregados, prepostos, assessores jurídicos, contábeis, auditores e demais terceiros contratados sob dever de sigilo.',
            '1.3 Finalidade: avaliação, negociação, formalização, execução e monitoramento da SCP/Séries, captação privada de investidores (sem oferta pública) e relacionamento operacional.'
        ]],
        ['2. OBRIGAÇÕES DE CONFIDENCIALIDADE', [
            '2.1 A Parte que receber Informações Confidenciais (Parte Receptora) deverá: (i) usar as informações apenas para a Finalidade; (ii) não divulgar a terceiros, salvo Representantes sob obrigação de sigilo equivalente; (iii) aplicar padrão de proteção não inferior ao que usa para seus próprios segredos (no mínimo, razoável/industrial).',
            '2.2 A Parte Receptora responderá por atos de seus Representantes como se seus fossem.',
            '2.3 É vedada a engenharia reversa ou tentativa de obtenção por meios indevidos.'
        ]],
        ['3. EXCEÇÕES', [
            'Não serão consideradas confidenciais as informações que a Parte Receptora comprove: (i) já serem públicas sem violação deste NDA; (ii) já as possuir legitimamente antes do recebimento; (iii) tê-las obtido de terceiro que não esteja vinculado a dever de sigilo; (iv) tê-las desenvolvido independentemente.'
        ]],
        ['4. DIVULGAÇÃO COMPULSÓRIA', [
            'Se a Parte Receptora for legalmente obrigada (lei/ordem judicial/regulatória) a revelar Informações Confidenciais, deverá, quando permitido, notificar previamente a Parte Divulgadora e cooperar para limitar o alcance da revelação (ex.: segredo de justiça). Revelará apenas o estritamente exigido.'
        ]],
        ['5. PROPRIEDADE E NÃO LICENÇA', [
            'As Informações Confidenciais permanecem de titularidade da Parte Divulgadora. Nenhuma licença, cessão, franquia, parceria, joint venture ou exclusividade é concedida por este NDA.'
        ]],
        ['6. DADOS PESSOAIS (LGPD)', [
            '6.1 Para dados pessoais trocados no âmbito da Finalidade, as Partes reconhecem que poderão atuar como controladoras independentes, controladora–operadora ou operadoras entre si, conforme o fluxo.',
            '6.2 Tratamentos se basearão em execução de contrato, legítimo interesse e/ou cumprimento de obrigação legal/regulatória.',
            '6.3 A Operadora implementará medidas técnicas e administrativas adequadas.',
            '6.4 A Parte que tiver ciência de incidente de segurança com dados pessoais notificará a outra Parte em até 48 horas.',
            '6.5 Transferências internacionais serão realizadas quando necessárias à Finalidade e em conformidade com a LGPD.',
            '6.6 As Partes cooperarão para responder tempestivamente às solicitações dos titulares.',
            '6.7 Dados pessoais serão mantidos pelo prazo necessário à Finalidade e a obrigações legais; ao término, serão eliminados ou anonimizados.'
        ]],
        ['7. SEGURANÇA DA INFORMAÇÃO — CONTROLES MÍNIMOS', [
            'A Parte Receptora deverá adotar e manter: (i) controle de acesso e autenticação forte; (ii) criptografia (quando cabível) para repositórios e trocas; (iii) proibição de envio a e-mails pessoais/armazenamento não autorizado; (iv) canal seguro para upload/download; (v) logs de acesso/modificação; (vi) plano de continuidade e backups; (vii) descarte seguro de mídias.'
        ]],
        ['8. DEVOLUÇÃO/DESTRUIÇÃO', [
            'A pedido da Parte Divulgadora ou quando cessar a Finalidade, a Parte Receptora devolverá ou destruirá (incluindo backups sob seu controle) as Informações Confidenciais em até 30 (trinta) dias úteis, emitindo declaração de destruição.'
        ]],
        ['9. NÃO PUBLICIDADE / NÃO OFERTA PÚBLICA', [
            'Nenhuma Parte poderá publicar ou anunciar a relação objeto desta Finalidade sem anuência prévia e escrita da outra. É vedada qualquer comunicação que possa caracterizar oferta pública de valores mobiliários; a captação é privada e dirigida.'
        ]],
        ['10. PRAZO E VIGÊNCIA', [
            '10.1 Vigência. Este NDA vigora a partir da assinatura por prazo indeterminado, até o encerramento do contrato fixado no termo de adesão.',
            '10.2 Sobrevivência. As obrigações de confidencialidade e de proteção de segredos empresariais permanecem por 5 (cinco) anos após o término deste NDA, ou indefinidamente enquanto a informação mantiver natureza de segredo de negócio.'
        ]],
        ['11. PENALIDADES E MEDIDAS', [
            '11.1 Medidas de urgência. A violação deste NDA pode causar dano irreparável; a Parte Divulgadora poderá buscar tutela inibitória/cautelar (inclusive medida liminar) além de perdas e danos.'
        ]],
        ['12. ANTICORRUPÇÃO E SANÇÕES', [
            'As Partes declaram cumprir a legislação anticorrupção aplicável e manter controles para evitar pagamentos indevidos, bem como observar listas de sanções nacionais e internacionais pertinentes.'
        ]],
        ['13. INTEGRALIDADE, CESSÃO, NOTIFICAÇÕES', [
            '13.1 Este NDA consubstancia todo o acordo de confidencialidade entre as Partes, substituindo entendimentos anteriores sobre o tema.',
            '13.2 Vedada a cessão, no todo ou em parte, sem consentimento escrito da outra Parte.',
            '13.3 Notificações e Comunicações: por escrito, para os e-mails/endereços indicados na qualificação, preferencialmente com confirmação de leitura/recebimento.'
        ]],
        ['14. LEI APLICÁVEL E SOLUÇÃO DE CONTROVÉRSIAS', [
            'Regido pelas leis brasileiras. Fica eleito o Foro Central da Comarca de São Paulo, no Estado de São Paulo, para dirimir quaisquer dúvidas ou litígios que possam eventualmente surgir em decorrência do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'
        ]]
    ];

    for (const [title, texts] of ndaClauses) {
        w.heading(title);
        for (const t of texts) w.text(t);
        w.space(4);
    }

    // NDA Signatures
    w.text(`São Paulo, ${dateLong}.`);
    w.space(LINE_SPACING_BODY * 3);
    w.signatureBlock(clientFullName, clientId, clientLabel);
    w.space();
    // FNCD Signature with image
    drawFncdSignature();

    // ═══════════════════════════════════════════════════════════════
    // SECTION 3: TERMO DE ADESÃO (Pages 13-17) - with dynamic data
    // ═══════════════════════════════════════════════════════════════
    w.newPage();
    w.title('FNCD CAPITAL LTDA SOCIEDADE EM CONTA DE PARTICIPAÇÃO 4T2025', 12);
    w.title('(FNCD CAPITAL LTDA SCP 4T2025)', 12);
    w.text(`Data: ${dateShort} Cidade/UF: São Paulo/SP`);
    w.space();

    w.heading('1. PARTES');
    w.text(`1.1 ${FNCD.name}, CNPJ ${FNCD.cnpj}, com sede à ${FNCD.address}, neste ato representada por ${FNCD.rep1} e ${FNCD.rep2}, doravante denominada "Ostensiva" ou "FNCD".`);
    w.space(4);
    w.text('1.2 Investidor (Sócio Participante):');
    w.text(`${clientQualif}, doravante denominado "investidor";`);
    w.space();

    w.heading('2. QUADRO-RESUMO DA ADESÃO');
    w.text('Série: FNCD CAPITAL LTDA SCP 4T2025');
    w.text('Contrato-Base aplicável (versão): SCP 4T2025');
    w.text(`Conta Bancária Dedicada da Série: ${FNCD.bank}`);
    w.text('Valor de Emissão por UP: R$ 1,00 (um real) (sem ágio), conforme Anexo A.');
    w.text(`Compromisso de Investimento para Subscrição: ${amountStr}.`, 12, true);
    w.text(`Quantidade de UPs após a integralização: ${upsStr}`, 12, true);
    w.text(`Lock-up: ${data.period} meses contados da integralização.`, 12, true);
    w.text(`Taxa de remuneração: ${data.rate.toFixed(2).replace('.', ',')}% a.m.`, 12, true);
    w.text(`Distribuições: mensais até o dia ${data.paymentDay}.`, 12, true);
    w.text(`Relatórios: trimestrais até o dia ${data.reportDay || 20}.`);
    w.space();

    // Termo de Adesão clauses
    const termoClauses: [string, string[]][] = [
        ['3. ADESÃO INTEGRAL E CONSTITUIÇÃO', [
            '3.1 Adesão integral. O Investidor adere integralmente ao Contrato-Base e a todos os Anexos (A–D), declarando tê-los lido e aceito, inclusive o Suplemento da Série (Anexo A), o Formulário do Investidor (Anexo B), o NDA (Anexo D) que integram este Termo por referência. Foi informado de que o Recibo (Anexo E) é enviado ao investidor somente após a integralização do patrimônio especial.',
            '3.2 Constituição condicionada (art. 995 CC). Caso este seja o primeiro Termo da Série, as Partes reconhecem que a SCP se reputa constituída nesta data, entre a FNCD (Ostensiva) e o(s) aderente(s). Ingressos posteriores estão autorizados e ocorrerão por Termo de Adesão adicional, dispensado o consentimento ou qualquer autorização dos demais desde que não haja diluição retroativa nem alteração de direitos adquiridos.',
            '3.3 O Investidor não possui direito de voto ou de gestão, detendo direitos econômicos e informacionais nos termos dos documentos da Série.'
        ]],
        ['4. SUBSCRIÇÃO E INTEGRALIZAÇÃO', [
            '4.1 Subscrição. O Investidor subscreve neste ato a quantidade de UPs indicado no Quadro-Resumo, ao Valor de Emissão (VE) definido no Anexo A, totalizando o Compromisso de investimento do Quadro-Resumo (sem ágio).',
            '4.2 A integralização ocorrerá por crédito identificado na Conta Bancária Dedicada da Série indicada no Anexo A e neste termo de adesão. A data de integralização será a do efetivo crédito, condicionada à conciliação bancária.',
            '4.3 Após a conciliação, a FNCD emitirá o Recibo de Integralização e Emissão de UPs (Anexo E), bem como fará o registro no Livro/Registro de UPs e investidores da Série.',
            '4.4 Natureza das UPs. As UPs têm natureza econômico-contratual, nominativa e pessoal, intransferível, ressalvadas hipóteses previstas no Contrato-Base/Anexo A.'
        ]],
        ['5. DIREITOS ECONÔMICOS, LIQUIDEZ E SAÍDA', [
            '5.1 O Investidor reconhece a ordem de prioridades, diretrizes e a política de Reservas conforme Contrato-Base e Anexo A, sendo vedado adiantamento de lucros.',
            '5.2 As distribuições de lucro seguirão as condições do Contrato-Base, do Anexo A (suplemento) e as condições do Quadro-Resumo deste Termo de Adesão, com as retenções fiscais se cabíveis.',
            '5.3 As janelas e eventos de liquidez aplicáveis são os definidos no Anexo A e no Contrato-Base; durante o lock-up não há liquidez, salvo hipóteses legais ou anuência da Ostensiva.',
            '5.4 Saída e apuração de haveres. Ocorrendo saída/encerramento, a apuração observará os critérios do Contrato-Base/Anexo A.'
        ]],
        ['6. REGRAS DE ADMISSÃO CONTINUADA (ART. 995 CC)', [
            '6.1 A Ostensiva pode admitir novos investidores por Termo de Adesão sem anuência dos anteriores, desde que observados: (i) ausência de diluição retroativa; (ii) manutenção de direitos já consolidados; (iii) KYC/KYB + Suitability + LGPD (Anexo B); (iv) integralização na Conta Dedicada; e (v) NDA.'
        ]],
        ['7. TRANSFERÊNCIA E ÔNUS', [
            '7.1 A cessão/transferência de UPs depende de anuência prévia e escrita da Ostensiva e do cumprimento de KYC/KYB do cessionário, observados lock-up e demais condições vigentes.',
            '7.2 Não é autorizada nenhuma oneração/garantia sobre UPs em qualquer hipótese.'
        ]],
        ['8. COMPLIANCE, RISCOS, PRIVACIDADE E COMUNICAÇÃO', [
            '8.1 O Investidor declara ciência e concordância com a Política de PLD/FT, autoriza consultas a lista de sanções e compromete-se a fornecer documentos KYC/KYB atualizados.',
            '8.2 O Investidor declara ter lido e compreendido os riscos do investimento (incluindo risco de mercado/câmbio, execução/contraparte, liquidez, operacional, regulatório), sem promessa de rentabilidade e sem garantia de preservação de capital (Termo de Riscos no Anexo B).',
            '8.3 LGPD. O Investidor confirma as autorizações e informações prestadas no Anexo B, autorizando o tratamento de dados estritamente para os fins da Série/Contrato-Base.',
            '8.4 Execução Cambial. O Investidor toma ciência de que operações de câmbio são executadas/liquidadas exclusivamente por Instituição Autorizada, podendo a FNCD atuar como correspondente/prestadora de serviços auxiliares.',
            '8.5 O Investidor reconhece que a captação é privada, sem oferta pública, e que as comunicações oficiais serão realizadas diretamente, conforme indicado no Anexo A/Contrato-Base.'
        ]],
        ['9. DECLARAÇÕES E ACEITES DO INVESTIDOR', [
            '9.1 O Investidor declara que possui plena capacidade civil e poderes suficientes para firmar este Termo e cumprir todas as obrigações dele decorrentes.',
            '9.2 O Investidor declara que os recursos utilizados para integralização têm origem lícita e não decorrem, direta ou indiretamente, de atividades ilícitas, comprometendo-se a fornecer comprovações e documentos complementares a pedido da FNCD se necessário.',
            '9.3 O Investidor afirma que todas as informações prestadas no Formulário do Investidor (Anexo B) e documentos correlatos são verdadeiras, completas e atuais, e se compromete a atualizá-las imediatamente sempre que houver alteração relevante.',
            '9.4 O Investidor reconhece e aceita que não possui direito de voto nem poderes de gestão na SCP, limitando-se seus direitos aos econômicos e informacionais previstos no Contrato-Base e no Suplemento (Anexo A).',
            '9.5 O Investidor aceita a utilização de assinatura eletrônica (ICP-Brasil ou soluções eletrônicas aceitas) em todos os documentos, reconhecendo-lhe validade e eficácia jurídica equivalentes à assinatura manuscrita.'
        ]],
        ['10. POLÍTICAS DIFERENCIADAS E INDIVIDUALIZADAS', [
            '10.1 Quaisquer condições específicas concedidas a determinado investidor deverão constar neste termo de Adesão individualizado firmado com a Ostensiva. Não haverá extensão automática aos demais investidores.'
        ]],
        ['11. ALTERAÇÕES, PREVALÊNCIA E VIGÊNCIA', [
            '11.1 Ajustes operacionais e alterações estruturais. A Ostensiva poderá ajustar parâmetros dentro das faixas previamente aprovadas no Suplemento da Série (Anexo A).',
            '11.2 Prevalência dos documentos. Em caso de conflito ou divergência, prevalecerá a seguinte ordem: (i) aditivos específicos; (ii) Contrato-Base da SCP; (iii) Suplemento da Série (Anexo A); (iv) este Termo de Adesão e Subscrição (Anexo C); (v) demais anexos (B, D e E).',
            '11.3 Vigência e sobrevivência. Este Termo entra em vigor na data da assinatura e permanecerá válido enquanto perdurar a participação do Investidor na Série.'
        ]],
        ['12. DISPOSIÇÕES FINAIS', [
            '12.1 Solução de controvérsias. Fica eleito o Foro Central da Comarca de São Paulo, no Estado de São Paulo, para dirimir quaisquer dúvidas ou litígios.',
            '12.2 Integração documental e forma. Este Termo integra o pacote documental da Série com os Anexos "A - E" e políticas referenciadas. Cópias eletrônicas e assinaturas digitais (com logs/selos de tempo) têm plena validade e eficácia probatória.',
            '12.3 Não exclusividade e ausência de vínculo societário adicional. A Ostensiva pode estruturar outras Séries e manter relações com terceiros, sem exclusividade.',
            '12.4 Os sócios declaram ter lido e compreendido todas as cláusulas deste termo de adesão, juntamente com o contrato-base da SCP e seus anexos, e o acharam em conformidade com suas vontades, pelo que livremente se obrigam a cumpri-lo, por si e por seus sucessores, assinando-o.'
        ]]
    ];

    for (const [title, texts] of termoClauses) {
        w.heading(title);
        for (const t of texts) w.text(t);
        w.space(4);
    }

    // Final signatures
    w.text(`São Paulo, ${dateLong}.`);
    w.space(LINE_SPACING_BODY * 3);
    w.signatureBlock(clientFullName, clientId, clientLabel);
    w.space();
    // FNCD Signature with image
    drawFncdSignature();

    // Footer on all pages
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
        const pageText = `Página ${i + 1} de ${pages.length}`;
        const pageTextW = font.widthOfTextAtSize(pageText, 10);
        const pageX = A4_W - MR - pageTextW;
        pages[i].drawText(pageText, {
            x: pageX, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5)
        });
    }

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes).toString('base64');
}
