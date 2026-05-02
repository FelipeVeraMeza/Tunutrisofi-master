import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. CONFIGURACIÓN DE CORS (Esto quita el error de "blocked by CORS")
app.use(cors({
  origin: '*', // Permite que cualquier sitio (como Vercel) le hable
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

// 2. LA RUTA EXACTA (Asegúrate que empiece con /api)
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  console.log("📩 Petición recibida desde Vercel...");
  
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No se recibió el archivo' });

  try {
    await transporter.sendMail({
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento: ${nombreArchivo} 🍎`,
      html: `<h2>¡Hola ${nombrePaciente}!</h2><p>Te adjunto tu archivo: <b>${nombreArchivo}</b>.</p>`,
      attachments: [{ filename: nombreArchivo, content: file.buffer }]
    });
    
    console.log("✅ Mail enviado con éxito");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error enviando mail:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. PUERTO PARA RAILWAY
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Cartero activo en puerto ${PORT}`);
});