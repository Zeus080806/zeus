const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const conectar = require('./bd');
const app = express();
const port =  3001;


//Configuracion de body-parser para procesar datos POST
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname, '../view')));

//ruta para mostrar el formulario de registro (GET)
app.get('/', (req,res) => {
    const filePath = path.join(__dirname, '../view', 'registro.html');
    console.log(`Sending file: ${filePath}`);
    res.sendFile(filePath);
});

app.get('/sesi', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'iniciosesion.html');
    console.log(`Sending file: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

//ruta para manejar el registro de usuario
app.post('/regis', async (req, res) => {
    const {nombre, cedula, correo, contrasena, ccontrasena} = req.body;
    //Verfificar que las contraseñas coincidan 
    if (contrasena !== ccontrasena){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        return res.status(400).send('Las contraseñas no coinciden');

    }

    try{

    //encriptar las contraseñas
    const poseidon = await bcrypt.hash(contrasena, 8);

    //crear objeto de usuario para insertar en la base de datos
    const usuario = {nombre, cedula, correo, contrasena: poseidon};

    //Verificar si la cedula ya esta registrada 
    conectar.query('SELECT *FROM registro WHERE cedula = ?', [cedula], (err, results) => {
        if (err) {
            console.error('Error al verificar cedula:', err.stack);
            return res.status(500).send('Error al verificar el registro del usuario');
        }
        if (results.length > 0){
            return res.status(400).send('El usuario con esta cedula ya esta registrado');

        }
        conectar.query('INSERT INTO registro SET ?', usuario, (err, result) => {
            if (err) {
                console.error('Error al insertar usuario:', err.stack);
                return res.status(500).send('Error al resgitrar el usuario');
            }
            console.log('Usuario resgitrado con exito');
            res.status(200).send('Usuario registrado con exito');
        });
    });
} catch (error) {
    console.error('Error al encriptrar la contraseña:', error);
    res.status(500).send('Error al procesar la solicitud');
}
});

//Ruta para manejar el inicio de sesion (POST)
app.post('/', (req, res) => {
    const {nombre, contrasena} = req.body;

    //Buscar el ususario en la base de datos 
    conectar.query('SELECT * FROM registro WHERE nombre = ?', [nombre], async (err, results) =>{
        if (err) {
            console.error('Error al buscar el usuario:', err.stack);
            return res.status(500).send('Error al buscar el usuario');
            
        }

        if (results.length === 0){
            return res.status(400).send('Usuario no encontrado');
        }

        const usuario = results[0];

        //Comparar la contraseña ingresada con la almacenada
        const ades = await bcrypt.compare(contrasena, usuario.contrasena);

        if(!ades) {
            return res.status(400).send('Contraseña incorrecta');
        }

        res.status(200).send('Inicio de sesion exitoso')
    });
});



//iniciar el servidor
app.listen(port,() => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});