const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const conectar = require('./bd');
const app = express();
const port = 3001;

// Middleware para leer datos JSON
app.use(express.json());

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


app.post('/regis', async (req, res) => {
    console.log(req.body);
    const {nombre, cedula, correo, contrasena, ccontrasena} = req.body;
    

    // Verificar que todos los campos estén presentes
    if (!nombre || !cedula || !correo || !contrasena || !ccontrasena) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    //Verificar que las contraseñas coincidan
    if (contrasena !== ccontrasena) {
       return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden' });
    }

    try {
        // Encriptar la contraseña
        const poseidon = await bcrypt.hash(contrasena, 8);

        // Crear objeto de usuario para insertar en la base de datos
        const usuario = {nombre, cedula, correo, contrasena: poseidon};

        // Verificar si la cédula ya está registrada
        conectar.query('SELECT *FROM registro WHERE cedula = ?', [cedula], (err, results) => {
            if (err) {
                console.error('Error al verificar cédula:', err.stack);
                return res.status(500).json({ success: false, message: 'Error al verificar el registro del usuario' });
            }
            if (results.length > 0) {
                return res.status(400).json({ success: false, message: 'El usuario con esta cédula ya está registrado' });
            }

            // Si la cédula no está registrada, insertar el nuevo usuario
            conectar.query('INSERT INTO registro SET ?', usuario, (err, result) => {
                if (err) {
                    console.error('Error al insertar usuario:', err.stack);
                    return res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
                }
                console.log('Usuario registrado con éxito');
                return res.status(200).json({ success: true, message: 'Usuario registrado con éxito' });
            });
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        return res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
    }
});


//  envio del inicio de sesion
app.post('/sesi', async (req, res) => {
    const { usuario, contrasena } = req.body;

    // Validar campos
    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
        // Buscar el usuario por correo, cédula u otro identificador
        conectar.query('SELECT * FROM registro WHERE nombre = ? OR contrasena = ?', [usuario, usuario], async (err, results) => {
            if (err) {
                console.error('Error al verificar el usuario:', err.stack);
                return res.status(500).json({ success: false, message: 'Error al verificar el usuario' });
            }

            // Verificar si el usuario existe
            if (results.length === 0) {
                return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
            }

            const usuarioDB = results[0]; // Obtener el usuario encontrado

            // Verificar la contraseña
            const esValida = await bcrypt.compare(contrasena, usuarioDB.contrasena);

            if (!esValida) {
                return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
            }

            // Inicio de sesión exitoso
            console.log('Usuario autenticado:', usuarioDB);
            res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
        });
    } catch (error) {
        console.error('Error al procesar el inicio de sesión:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
    }
});



app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
