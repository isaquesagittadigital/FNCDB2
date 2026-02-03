
import axios from 'axios';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'suporte@fncdcapital.com.br'; // Based on the template image
const SENDER_NAME = 'Equipe FNCD Capital';

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
                <h1 style="color: white; margin: 0; font-size: 24px;"><span style="color: #f2c94c;">FNCD</span> Capital</h1>
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
