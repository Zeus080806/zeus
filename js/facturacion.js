const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const conectar = require('./bd');
const app = express();
const port =  3001;

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'../view'));

//Mostrar interfaz principal del area de facturacion
app.get('/', (req, res) => {
    console.log('Ruta fue accedida');
     const filePath = path.join(__dirname, '../view','principalfac.html');
     console.log(`Ruta absoluta del archivo: ${filePath}`);
     res.sendFile(filePath, (err) => {
         if (err) {
             console.log('Error al enviar el archivo:', err);
             res.status(404).send('Archivo no encontrado');
         }
     });
 });

 //Crear (CREATE) - mostrar formulario
app.get('/facturafa/nuevo', (req, res) => {
    res.render('nuevafactura');
});

//Leer (READ) -  mostrar listado de todas las facturas
app.get('/facturafa', (req, res) => {
    conectar.query('SELECT * FROM facturacion', (err, results) => {
        if (err) {
            console.error('Error al obtener las facturas:', err.stack);
            res.status(500).send('Error al obtener las facturas');
            return;
        }
        console.log(results);
        res.render('listadofac', { facturafa: results});
    });
});
//Crear (CREATE) - guardar en la base de datos
app.post('/facturafa', (req, res) => {
    const nuevafactura = req.body;
    conectar.query('INSERT INTO facturacion SET ?', nuevafactura, (err, result) => {
        if (err) {
            console.error('Error al insertar factura:', err.stack);
            res.status(500).send('Error al registrar el factura');
            return;
        }
        res.redirect('/facturafa');
    });
});
// Leer (READ) - mostrar una factura en especifico
app.get('/facturafa/:id', (req, res) => {
    const id = req.params.id;
    
    const query = 'SELECT * FROM facturacion WHERE idfactura = ?'; 
    conectar.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener los detalles de la factura');
        }

        if (result.length > 0) {
            res.render('detallefac', { facturaf: result[0] }); 
        } else {
            res.status(404).send('Factura no encontrada');
        }
    });
});
//Actualizar (Update) - Mostrar formulario con los datos actuales
app.get('/facturafa/editar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('SELECT * FROM facturacion WHERE idfactura = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la factura:', err.stack);
            res.status(500).send('Error al obtener la factura');
            return;
        }
        if (result.length ===0){
            return res.status(404).send('Factura no encontrada');
        }
        res.render('editarfac', { facturaf: result[0]});
    });
});
//Actualizar (Update) - guardar cambios en la base de datos
app.post('/facturafa/editar/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    conectar.query('UPDATE facturacion SET ? WHERE idfactura = ?', [datosActualizados, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la factura:', err.stack);
            res.status(500).send('Error al actualizar la factura');
            return;
        }
        console.log('Cambios guardados');
        return res.send('Cambios guardados exitosamente');
    });
});
//Eliminar (DELETE)
app.post('/facturafa/eliminar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('DELETE FROM facturacion WHERE idfactura = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la factura:', err.stack);
            res.status(500).send('Error al eliminar la factura');
            return;
        }
        console.log('Factura con ID ${id} eliminada exitosamente.')
        return res.send('Factura eliminada con exito');
    });
});
// funcionalidad del resgitro de facturas del area de facturacion
//Ruta para mostrar el formulario de registro de factura (GET)
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

app.post('/fact', (req, res) => {
    const {idfactura, nombrep, descripcion, precio} = req.body;
    
// Primero, verifica si el idfactura ya existe
conectar.query('SELECT * FROM facturacion WHERE idfactura = ?', [idfactura], (err, rows) => {
    if (err) {
        console.error(err);
        return res.status(500).send('Error al verificar la factura.');
    }
    
    if (rows.length > 0) {
        // ID ya existe, envía un error al cliente
        return res.status(400).send('Error: El ID de factura ya está registrado.');
    }

    // Si no existe, procede a insertar la nueva factura
    const INSERT_FACTURA_QUERY = `INSERT INTO facturacion (idfactura, nombrep, descripcion, precio) VALUES (?, ?, ?, ?)`;
    conectar.query(INSERT_FACTURA_QUERY, [idfactura, nombrep, descripcion, precio], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al crear la factura');
        } else {
            console.log('Factura creada con éxito');
            return res.status(200).send('Factura guardada con éxito.');
        }
    });
});
});



//puerto donde correra el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

