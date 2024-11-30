const express = require ('express');
const mysql = require('mysql');
const bodyParser = require ('body-parser');
const path = require ('path');
const conectar = require ('./bd');
const methodOverride = require ('method-override');

const app = express();
const port = 3001;

//manejar datos del formulario
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//consfigurar method-override como middleware
app.use(methodOverride('_method'));

//configurar express para servir archivos estaticos 
app.use(express.static(path.join(__dirname, 'view')));
app.set('view engine', 'ejs');
app.set('view', path.join(__dirname, 'view'));


//metodo para mostrar la pagina principal 
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'pagina.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('No se encuentra el archivo pagina.html');
        }
    });
});

app.get('/gestion', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'funcionario.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

app.get('/bode', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'bodega.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});


app.get('/fact', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'factura.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

// enviar datos registrados a la base de datos

//ruta para manejar el regsitro de funcionarios (POST)
app.post('/fun', (req, res) => {
    const {idusuario, cedula, nombre, apellido, correo, eps, fp, hijos, estadocivil} = req.body;
    
    //verificacion si ya existe una cedula
    conectar.query('SELECT * FROM gestionh WHERE cedula = ?', cedula, (err, rows) => {
      if (err) {
        console.log('Error al verificar cedula:', err.stack);
        return res.status(500).send('Error al verificar cedula en la base de datos');

      } 
      
      if (rows.length > 0) {
        return res.status(400).send('La cedula ya esta registrada');

      } else {

        //crear objeto de funcioanrios para insertar en la base de datos
        const empleado = {idusuario, cedula, nombre, apellido, correo, eps, fp, hijos, estadocivil };
        console.log('Datos recibidos:', empleado);

        //Insertar funcionario a la base de datos
        conectar.query('INSERT INTO gestionh SET ?', empleado, (err, result) => {
            if (err) {
                console.log('Error al insertar funcionario:', err.stack);
                return res.status(500).send('Error al registrar el funcionario');
            }

            console.log('Funcionario registrado con exito');
            return res.send('Funcionario registrado con exito');
        });
      }
    });
});


app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

