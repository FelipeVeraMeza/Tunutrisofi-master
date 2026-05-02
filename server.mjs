import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. CORS Total (Sin restricciones para que Vercel entre siempre)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
const upload = multer();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI,
  },
});

// --- NUEVA RUTA DE PRUEBA (Para ver si el cartero vive) ---
app.get('/', (req, res) => {
  res.send('🚀 El cartero de Nutrisofi está despierto y escuchando!');
});

// 2. LA RUTA DE ENVÍO (Asegúrate que tenga /api al inicio)
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  console.log("📩 Petición de correo recibida...");
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No llegó el archivo al servidor' });
  }

  try {
    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te envío adjunto tu archivo.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error('❌ Error Nodemailer:', error);
    res.status(500).json({ error: 'Error interno al enviar mail' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cartero de Nutrisofi activo en puerto ${PORT}`);
});