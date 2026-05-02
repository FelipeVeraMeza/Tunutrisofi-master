import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

const upload = multer();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI,
  },
});

app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  try {
    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te envío adjunto el documento: <b>${nombreArchivo}</b>.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Cartero activo en puerto ${PORT}`));