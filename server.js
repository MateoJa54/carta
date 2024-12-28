const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta del archivo JSON
const archivoJSON = path.join(__dirname, 'destinatarios.json');

// Asegurarse de que el archivo JSON exista
if (!fs.existsSync(archivoJSON)) {
    fs.writeFileSync(archivoJSON, '[]', 'utf8');
}

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta "public"

// Ruta para obtener los destinatarios
app.get('/destinatarios', (req, res) => {
    fs.readFile(archivoJSON, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.json([]); // Si el archivo no existe, retorna un arreglo vacío
            }
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ error: 'Error al analizar el archivo JSON' });
        }
    });
});

// Ruta para agregar un nuevo destinatario
app.post('/destinatarios', (req, res) => {
    const nuevoDestinatario = req.body;

    fs.readFile(archivoJSON, 'utf8', (err, data) => {
        let destinatarios = [];
        if (!err) {
            try {
                destinatarios = JSON.parse(data) || [];
            } catch (e) {
                console.error('Error al analizar JSON:', e.message);
            }
        }
        destinatarios.push(nuevoDestinatario);

        fs.writeFile(archivoJSON, JSON.stringify(destinatarios, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el archivo' });
            }
            res.status(201).json({ message: 'Destinatario agregado exitosamente' });
        });
    });
});

app.get('/', (req, res) => {
    res.redirect('/index.html'); // Redirige al archivo en la carpeta public
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
