const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo'); // Guardar sesiones en MongoDB

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Variables de entorno
const EMAIL = process.env.EMAIL;
const PASSWD = process.env.PASSWD;
const MONGO_URI = process.env.MONGO_URI;

// Conectar a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

const UsuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Correo único
    password: { type: String, required: true }, // Contraseña encriptada
    hijoGenero: { type: String, enum: ['niño', 'niña'], required: true } // Género del hijo
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

const CartaSchema = new mongoose.Schema({
    email: String,
    subject: String,
    message: String,
    image: String, // Se almacenará como base64 o URL
    sentAt: { type: Date, default: Date.now }
});

const Carta = mongoose.model('Carta', CartaSchema);

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
}));
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Configurar sesiones
app.use(session({
    secret: 'secreto_seguro',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Configurar transporte de nodemailer
const transporter = nodemailer.createTransport(
    {
        service : 'gmail',
        auth : {
            user : EMAIL,
            pass : PASSWD
        }
    }
)


app.get('/', (req, res) => {
    res.send('api works');
});

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    next();
};

// ====================== AUTENTICACIÓN ======================

// Registro de usuario
app.post('/registro', async (req, res) => {
    try {
        const { email, password, hijoGenero } = req.body;

        // Validar campos obligatorios
        if (!email || !password || !hijoGenero) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        // Verificar si el correo ya está registrado
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({ email, password: hashedPassword, hijoGenero });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ email });

        // Verificar credenciales
        if (usuario && await bcrypt.compare(password, usuario.password)) {
            req.session.user = usuario.email; // Guardar correo en la sesión
            return res.status(200).json({ message: 'Login exitoso' });
        } else {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Verificar sesión
app.get('/perfil', verificarAutenticacion, (req, res) => {
    res.json({ user: req.session.user });
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Sesión cerrada' });
    });
});

// ====================== ENVÍO DE CARTAS ======================

app.post('/send-email', async (req, res) => {
    // verify fields email, subject, message and image, if not return 400 status

    if (!req.body.email || !req.body.subject || !req.body.message ) {
        console.log(req.body);
        return res.status(400).json({ error: 'Email, subject, message and image are required' });
    }


    try{
        let mailOptions = {
            from : EMAIL,
            to : req.body.email,
            subject : req.body.subject,
            text : req.body.message,
            attachments : []
        }

        if (req.body.image) {
            mailOptions.attachments.push({
              filename: "imagen.png",
              content:   req.body.image,
            //   path: req.body.image.startsWith("http") ? req.body.image : undefined,
              encoding: "base64",
            });
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email sent' });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
    }

});

// Servidor
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://0.0.0.0:${port}`);
});
