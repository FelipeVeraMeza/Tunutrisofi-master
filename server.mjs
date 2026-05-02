import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. CONFIGURACIÓN DE CORS: Vital para que Vercel no se bloquee
app.use(cors({
  origin: '*', // Permite que cualquier sitio le hable
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
const upload = multer();

// 2. RUTA DE SALUD: Para que Railway sepa que estás vivo
app.get('/', (req, res) => {
  res.status(200).send('🚀 Cartero de Nutrisofi ONLINE');
});

// 3. CONFIGURACIÓN DE GMAIL
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI, // Tu clave de 16 letras
  },
});

// 4. RUTA DE ENVÍO
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Falta el archivo' });

  try {
    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te envío adjunto tu: <b>${nombreArchivo}</b>.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    console.log(`✅ Mail enviado a ${email}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. PUERTO DINÁMICO: Crítico para Railway
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});