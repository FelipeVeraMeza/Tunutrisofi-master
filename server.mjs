import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno (.env)
dotenv.config();

const app = express();

// =====================================================================
// ⚙️ CONFIGURACIÓN DE SEGURIDAD Y RECEPCIÓN
// =====================================================================
// Permite que tu web en Vercel se comunique sin bloqueos (CORS)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Multer se encarga de atrapar el archivo que viene desde la web
const upload = multer();

// =====================================================================
// 🚀 RUTA DE SALUD (Para que Railway sepa que estamos vivos)
// =====================================================================
app.get('/', (req, res) => {
  res.status(200).send('✅ Cartero de Nutrisofi ONLINE y listo para entregar.');
});

// =====================================================================
// 📧 CONFIGURACIÓN DEL MOTOR DE CORREOS (NODEMAILER)
// =====================================================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Usa seguridad SSL
  auth: {
    user: process.env.EMAIL_NUTRISOFI,
    pass: process.env.PASS_NUTRISOFI,
  },
  // Esto fuerza a usar conexiones estables y evita timeouts en la nube
  tls: {
    rejectUnauthorized: false
  }
});

// =====================================================================
// 🎯 RUTA PRINCIPAL: RECIBE EL ARCHIVO Y LO ENVÍA
// =====================================================================
app.post('/api/notificar-documento', upload.single('file'), async (req, res) => {
  const { email, nombrePaciente, nombreArchivo } = req.body;
  const file = req.file;

  // Validación: Si no llegó el archivo, avisar del error
  if (!file) {
    console.error(`❌ Error: No llegó ningún archivo para ${email}`);
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  console.log(`⏳ Procesando envío para: ${nombrePaciente} (${email})...`);

  try {
    // Estructura del correo (Similar a tu script, pero estilo Nutrisofi)
    const mailOptions = {
      from: `"Tu Nutri Sofi" <${process.env.EMAIL_NUTRISOFI}>`,
      to: email,
      subject: `Nuevo documento disponible: ${nombreArchivo} 🍎`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #FF6B9D; padding: 20px; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #FF6B9D;">¡Hola ${nombrePaciente}!</h2>
          <p>Junto con saludar, te informo que he preparado un nuevo documento para ti.</p>
          <p>Te envío adjunto: <strong>${nombreArchivo}</strong>.</p>
          <br>
          <p>Recuerda que también puedes encontrarlo siempre disponible en tu perfil privado en <a href="https://tunutrisofi.cl" style="color: #FF6B9D;">tunutrisofi.cl</a>.</p>
          <br>
          <p>Un abrazo,<br><strong>Sofía Cordero</strong><br>Nutricionista</p>
        </div>
      `,
      attachments: [
        {
          filename: nombreArchivo,
          content: file.buffer // Aquí va el archivo real atrapado por Multer
        }
      ]
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ CORREO ENVIADO EXITOSAMENTE A: ${email}`);
    res.status(200).json({ success: true, message: 'Correo enviado' });

  } catch (error) {
    console.error(`❌ ERROR AL ENVIAR a ${email}:`, error.message);
    res.status(500).json({ error: 'Fallo al enviar el correo' });
  }
});

// =====================================================================
// 🔌 ENCENDIDO DEL SERVIDOR (CRÍTICO PARA RAILWAY)
// =====================================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("==================================================");
  console.log(`🚀 SERVIDOR ACTIVO ESCUCHANDO EN PUERTO ${PORT}`);
  console.log("==================================================");
});