const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const conectar = require('./bd');
const app = express();
const port = 3001;

//configuracion de body-parser para procesar datos POST
app.use(bodyParser.urlencoded({extended: true}));

//configurar express para servir archivos estaticos
app.use(express.static(path.join(__dirname, '../view')));

//ruta para mostrar el formulario de registro

app.get('/', (req,res) => {
    const filePath = path.join(__dirname, '../view', 'principal.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('No se encuentra el archivo principal.html');
        }
    });
});

app.get('/regis', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'registro.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err );
            res.status(404).send('No se encuentra el archivo registro.html');
        }
    });
});

app.get('/sesi', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'iniciosesion.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err );
            res.status(404).send('No se encuentra el archivo iniciosesion.html');
        }
    });
});





app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
