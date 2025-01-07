const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8800;

// Middleware para procesar JSON y archivos estáticos
app.use(bodyParser.json());
app.use(express.static('public')); // Servir archivos estáticos desde la carpeta 'public'

// Cargar destinatarios desde el archivo JSON
const destinatarios = JSON.parse(fs.readFileSync('destinatarios.json', 'utf-8'));

// Función para obtener el correo electrónico basado en el parentesco
function obtenerCorreoPorParentesco(parentesco) {
    const destinatario = destinatarios.find(d => d.parentesco === parentesco);
    if (!destinatario) {
        throw new Error(`No se encontró un destinatario con el parentesco: ${parentesco}`);
    }
    return destinatario.correo;
}

// Ruta principal para enviar correos
app.post('/enviar-correo', async (req, res) => {
    const { parentesco, asunto, mensaje, archivo } = req.body;

    if (!parentesco || !asunto || !mensaje || !archivo) {
        return res.status(400).json({ error: 'Faltan datos obligatorios (parentesco, asunto, mensaje, archivo).' });
    }

    try {
        const destinatarioCorreo = obtenerCorreoPorParentesco(parentesco);
        const rutaArchivo = `cartas/${parentesco}_carta.png`;
        fs.writeFileSync(rutaArchivo, archivo, 'base64');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: destinatarioCorreo,
            subject: asunto,
            text: mensaje,
            attachments: [
                {
                    filename: `${parentesco}_carta.png`,
                    path: rutaArchivo,
                },
            ],
        });

        res.status(200).json({ message: 'Correo enviado exitosamente con la carta adjunta.' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Ocurrió un error al enviar el correo.' });
    }
});

// Crear la carpeta "cartas" si no existe
if (!fs.existsSync('cartas')) {
    fs.mkdirSync('cartas');
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

