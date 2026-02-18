
import axios from 'axios';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'suporte@fncdcapital.com.br'; // Based on the template image
const SENDER_NAME = 'Equipe FNCD Capital';
const LOGO_URL = 'https://ktuztuypejbbzjadlemh.supabase.co/storage/v1/object/public/assets/logos/LogoFonteBranca.png';

export const sendWelcomeEmail = async (email: string, name: string, actionLink: string) => {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background-color: #00BCC9; padding: 30px; text-align: center; }
            .content { padding: 40px; color: #333; line-height: 1.6; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: #00BCC9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            .highlight { color: #f2c94c; font-weight: bold; }
            .quote { border-left: 4px solid #00BCC9; padding-left: 15px; margin: 20px 0; font-style: italic; color: #666; background: #f9f9f9; padding: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${LOGO_URL}" alt="FNCD Capital" style="height: 40px; max-width: 200px;" />
            </div>
            <div class="content">
                <h2>Bem-vindo(a), ${name}</h2>
                <p>É com grande entusiasmo que recebemos você na <strong>FNCD Capital</strong>!</p>
                <p>Seu cadastro foi realizado com sucesso em nossa plataforma. Agora, para garantir a segurança e ativar sua conta, você precisa apenas criar uma senha de acesso.</p>
                
                <div class="button-container">
                    <a href="${actionLink}" class="button">Criar Minha Senha de Acesso</a>
                </div>

                <div class="quote">
                    Se você não fez este cadastro, por favor, ignore esta mensagem.
                </div>

                <p>Atenciosamente,<br>Equipe <strong>FNCD Capital</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 FNCD Capital. Todos os direitos reservados.</p>
                <p>Dúvidas? Entre em contato pelo WhatsApp ou envie um e-mail para <br>
                <a href="mailto:suporte@fncdcapital.com.br" style="color: #00BCC9;">suporte@fncdcapital.com.br</a></p>
                <p>Instagram | Facebook | LinkedIn</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await axios.post(url, {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: email, name: name }],
            subject: 'Bem-vindo(a) à FNCD Capital - Crie sua senha',
            htmlContent: htmlContent
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error sending email via Brevo:', error.response?.data || error.message);
        throw new Error('Falha ao enviar email de confirmação');
    }
};

export const sendRenewalRequestEmail = async ({
    consultantEmail,
    consultantName,
    clientName,
    contractCode,
    requestDate,
}: {
    consultantEmail: string;
    consultantName: string;
    clientName: string;
    contractCode: string;
    requestDate: string;
}) => {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background-color: #00BCC9; padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 40px; color: #333; line-height: 1.8; }
            .content h2 { font-size: 18px; font-weight: bold; color: #222; margin-bottom: 20px; }
            .info-card { background-color: #eaf7f8; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-card .label { font-size: 12px; color: #666; margin-bottom: 2px; }
            .info-card .value { font-size: 14px; font-weight: bold; color: #222; margin-bottom: 12px; }
            .info-card .value:last-child { margin-bottom: 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${LOGO_URL}" alt="FNCD Capital" style="height: 40px; max-width: 200px;" />
            </div>
            <div class="content">
                <h2>Solicitação de Renovação de Contrato</h2>

                <p>Olá <strong>${consultantName}</strong>,</p>

                <p>Venho por meio deste solicitar a renovação do contrato firmado junto a esta instituição, conforme as condições previstas contratualmente e políticas vigentes.</p>

                <div class="info-card">
                    <div class="label">Nome do Cliente:</div>
                    <div class="value">${clientName}</div>

                    <div class="label">Código do Contrato:</div>
                    <div class="value">${contractCode}</div>

                    <div class="label">Data da Solicitação:</div>
                    <div class="value">${requestDate}</div>
                </div>

                <p style="color: #00BCC9;">Solicito, por gentileza, que sejam informadas as condições aplicáveis à renovação, incluindo prazos, valores atualizados, eventuais ajustes contratuais, encargos e os documentos necessários para a formalização do processo.</p>

                <p style="color: #00BCC9;">Fico no aguardo das orientações para dar continuidade à renovação e coloco-me à disposição para quaisquer esclarecimentos adicionais.</p>

                <p><em>Atenciosamente,</em><br><strong>Equipe FNCD Capital</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 FNCD Capital. Todos os direitos reservados.</p>
                <p>Dúvidas? Entre em contato pelo WhatsApp ou envie um e-mail para <br>
                <a href="mailto:suporte@fncdcapital.com.br" style="color: #00BCC9;">suporte@fncdcapital.com.br</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await axios.post(url, {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: consultantEmail, name: consultantName }],
            subject: 'Solicitação de Renovação de Contrato',
            htmlContent: htmlContent
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error sending renewal email via Brevo:', error.response?.data || error.message);
        throw new Error('Falha ao enviar email de renovação');
    }
};

export const sendRedeemRequestEmail = async ({
    consultantEmail,
    consultantName,
    clientName,
    contractCode,
    requestDate,
    redeemValue,
    redeemType,
    contractValue,
}: {
    consultantEmail: string;
    consultantName: string;
    clientName: string;
    contractCode: string;
    requestDate: string;
    redeemValue: string;
    redeemType: string;
    contractValue: string;
}) => {
    const url = 'https://api.brevo.com/v3/smtp/email';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background-color: #00BCC9; padding: 30px; text-align: center; }
            .content { padding: 40px; color: #333; line-height: 1.8; }
            .content h2 { font-size: 18px; font-weight: bold; color: #222; margin-bottom: 20px; }
            .info-card { background-color: #fdf2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-card .label { font-size: 12px; color: #991b1b; margin-bottom: 2px; }
            .info-card .value { font-size: 14px; font-weight: bold; color: #7f1d1d; margin-bottom: 12px; }
            .info-card .value:last-child { margin-bottom: 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${LOGO_URL}" alt="FNCD Capital" style="height: 40px; max-width: 200px;" />
            </div>
            <div class="content">
                <h2>Solicitação de Resgate de Valores</h2>

                <p>Olá <strong>${consultantName}</strong>,</p>

                <p>O cliente solicitou o resgate de valores referente ao contrato abaixo. Por favor, analise a solicitação e proceda com os trâmites necessários.</p>

                <div class="info-card">
                    <div class="label">Nome do Cliente:</div>
                    <div class="value">${clientName}</div>

                    <div class="label">Código do Contrato:</div>
                    <div class="value">${contractCode}</div>

                    <div class="label">Tipo de Resgate:</div>
                    <div class="value">${redeemType}</div>

                    <div class="label">Valor Solicitado:</div>
                    <div class="value">${redeemValue}</div>

                    <div class="label">Valor Total do Contrato:</div>
                    <div class="value">${contractValue}</div>

                    <div class="label">Data da Solicitação:</div>
                    <div class="value">${requestDate}</div>
                </div>

                <p style="color: #dc2626;">Atenção: Esta solicitação requer análise de liquidez e prazos contratuais.</p>

                <p><em>Atenciosamente,</em><br><strong>Equipe FNCD Capital</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 FNCD Capital. Todos os direitos reservados.</p>
                <p>Dúvidas? Entre em contato pelo WhatsApp ou envie um e-mail para <br>
                <a href="mailto:suporte@fncdcapital.com.br" style="color: #00BCC9;">suporte@fncdcapital.com.br</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const response = await axios.post(url, {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: consultantEmail, name: consultantName }],
            subject: `Solicitação de Resgate - ${clientName} (Contrato ${contractCode})`,
            htmlContent: htmlContent
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error sending redeem email via Brevo:', error.response?.data || error.message);
        throw new Error('Falha ao enviar email de resgate');
    }
};
