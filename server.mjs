import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. CONFIGURACIÓN DE CORS TOTAL
app.use(cors({
  origin: '*', // Esto permite que Vercel entre sin problemas
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

// RUTA DE PRUEBA (Para ver si el cartero vive)
app.get('/', (req, res) => {
  res.send('🚀 El cartero de Nutrisofi está FUNCIONANDO en Railway');
});

// RUTA DE ENVÍO
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No hay archivo' });

  try {
    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te envío tu archivo.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. PUERTO DINÁMICO PARA RAILWAY (Súper importante)
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});