// server.mjs
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors()); // Permite que tu web se comunique con este servidor
app.use(express.json());

const upload = multer(); // Para recibir el archivo en memoria

// Configuración de Nodemailer (tu motor que ya funciona)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI,
  },
});

// RUTA MÁGICA: Recibe el archivo y lo manda por mail
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  try {
    const mailOptions = {
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #FF6B9D; padding: 20px; border-radius: 10px;">
          <h2 style="color: #FF6B9D;">¡Hola ${nombrePaciente}!</h2>
          <p>Te envío adjunto el documento: <strong>${nombreArchivo}</strong>.</p>
          <p>También puedes encontrarlo siempre disponible en tu perfil de <a href="https://tunutrisofi.cl">tunutrisofi.cl</a>.</p>
          <br>
          <p>Un abrazo,<br>Sofía Cordero</p>
        </div>
      `,
      attachments: [{
        filename: nombreArchivo,
        content: file.buffer
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a: ${email}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error enviando mail:', error);
    res.status(500).json({ error: 'Fallo al enviar el correo' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Cartero de Nutrisofi activo en http://localhost:${PORT}`);
});