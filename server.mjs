import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// CORS para que Vercel pueda entrar
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
const upload = multer();

// RUTA DE SALUD (Para que Railway vea que el cartero está vivo)
app.get('/', (req, res) => {
  res.status(200).send('🚀 Cartero de Nutrisofi ONLINE');
});

// TU RUTA DE ENVÍO
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;
  if (!file) return res.status(400).send('No hay archivo');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_NUTRISOFI,
        pass: process.env.PASS_NUTRISOFI,
      },
    });

    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te envío tu archivo adjunto.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUERTO DINÁMICO (Railway usará el 8080 que sale en tu captura)
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});