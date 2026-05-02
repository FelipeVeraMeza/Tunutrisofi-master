// api/notificar.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Verificamos que sea una petición POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo acepto POST' });
  }

  const { email, nombrePaciente, nombreArchivo, fileUrl } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_NUTRISOFI,
        pass: process.env.PASS_NUTRISOFI,
      },
    });

    const mailOptions = {
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento disponible: ${nombreArchivo} 🍎`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #FF6B9D; padding: 20px; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #FF6B9D;">¡Hola ${nombrePaciente}!</h2>
          <p>Te informo que he preparado un nuevo documento para ti.</p>
          <p>Te envío adjunto: <strong>${nombreArchivo}</strong>.</p>
          <br>
          <p>Recuerda que también puedes encontrarlo en tu perfil privado en <a href="https://tunutrisofi.cl" style="color: #FF6B9D;">tunutrisofi.cl</a>.</p>
          <br>
          <p>Un abrazo,<br><strong>Sofía Cordero</strong><br>Nutricionista</p>
        </div>
      `,
      attachments: [
        {
          filename: nombreArchivo,
          path: fileUrl // ¡MAGIA! Nodemailer descargará el PDF desde Supabase y lo adjuntará
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Correo enviado' });

  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ error: 'Fallo al enviar el correo' });
  }
}