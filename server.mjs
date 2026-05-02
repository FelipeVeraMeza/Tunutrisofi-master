import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();

// 1. CONFIGURACIÓN DE CORS: Permite que tu web en Vercel se comunique sin bloqueos
app.use(cors({
  origin: '*', // En producción puedes cambiarlo por 'https://tunutrisofi.vercel.app'
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configuración de Multer para recibir archivos en memoria
const upload = multer();

// 2. RUTA DE SALUD (VITAL PARA RAILWAY): 
// Evita que Railway apague el servidor por "falta de respuesta"
app.get('/', (req, res) => {
  res.status(200).send('🚀 Cartero de Nutrisofi ONLINE y listo para entregar!');
});

// 3. CONFIGURACIÓN DEL TRANSPORTADOR (GMAIL)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI,
  },
});

// 4. RUTA PRINCIPAL: Envío de correo con adjunto
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  console.log("📩 Recibida solicitud de correo para:", req.body.email);

  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  try {
    const mailOptions = {
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento disponible: ${nombreArchivo} 🍎`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #FF6B9D; padding: 20px; border-radius: 15px; max-width: 500px;">
          <h2 style="color: #FF6B9D; text-align: center;">¡Hola ${nombrePaciente}!</h2>
          <p>Te envío adjunto tu documento: <strong>${nombreArchivo}</strong>.</p>
          <p>Recuerda que también puedes revisarlo en cualquier momento desde tu perfil en nuestra web.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Enviado automáticamente por el sistema de Nutrisofi</p>
        </div>
      `,
      attachments: [
        {
          filename: nombreArchivo,
          content: file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado con éxito a: ${email}`);
    res.status(200).json({ success: true, message: 'Correo enviado correctamente' });

  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    res.status(500).json({ 
      error: 'Error interno al enviar el correo', 
      details: error.message 
    });
  }
});

// 5. ARRANQUE DEL SERVIDOR (CRÍTICO PARA RAILWAY)
// Usamos 0.0.0.0 y el puerto que nos asigne la plataforma
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Nutrisofi activo y escuchando en el puerto ${PORT}`);
});