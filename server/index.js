import 'dotenv/config';
import express from 'express';
import sgMail from '@sendgrid/mail';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn("WARNING: SENDGRID_API_KEY is missing in .env file. Email sending will fail.");
}

app.post('/api/recover', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!process.env.SENDGRID_API_KEY) {
        console.error("Attempted to send email but SENDGRID_API_KEY is missing.");
        return res.status(500).json({ error: 'Server misconfiguration: API Key missing' });
    }

    const msg = {
        to: email,
        from: 'no-reply@tomi-gabi-gastos.com', // Change this to your verified sender
        subject: 'Recuperación de Contraseña - Gastos Tomi/Gabi',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Gastos Tomi/Gabi</h1>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hola,</p>
                    <p>Has solicitado recuperar tu contraseña para la aplicación de <strong>Gastos Tomi/Gabi</strong>.</p>
                    <p>Para continuar con el proceso, utiliza el siguiente código de verificación (simulado):</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; font-weight: bold; font-size: 24px; letter-spacing: 2px; margin: 20px 0;">
                        ${Math.floor(100000 + Math.random() * 900000)}
                    </div>
                    <p>Si no fuiste tú quien solicitó esto, por favor ignora este correo.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                    &copy; ${new Date().getFullYear()} Gastos Tomi/Gabi. Todos los derechos reservados.
                </div>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body);
        }
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
