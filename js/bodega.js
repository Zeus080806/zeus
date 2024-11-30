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

//Mostrar interfaz principal del area de bodega 
app.get('/', (req, res) => {
    console.log('Ruta fue accedida');
     const filePath = path.join(__dirname, '../view','principalbod.html');
     console.log(`Ruta absoluta del archivo: ${filePath}`);
     res.sendFile(filePath, (err) => {
         if (err) {
             console.log('Error al enviar el archivo:', err);
             res.status(404).send('Archivo no encontrado');
         }
     });
 });

//Crear (CREATE) - mostrar formulario
app.get('/facturabo/nuevo', (req, res) => {
    res.render('nuevafactura');
});

//Leer (READ) -  mostrar listado de todas las facturas
app.get('/facturabo', (req, res) => {
    conectar.query('SELECT * FROM bodega', (err, results) => {
        if (err) {
            console.error('Error al obtener las facturas:', err.stack);
            res.status(500).send('Error al obtener las facturas');
            return;
        }
        console.log(results);
        res.render('listadob', { facturabo: results});
    });
});

//Crear (CREATE) - guardar en la base de datos
app.post('/facturabo', (req, res) => {
    const nuevafactura = req.body;
    conectar.query('INSERT INTO bodega SET ?', nuevafactura, (err, result) => {
        if (err) {
            console.error('Error al insertar factura:', err.stack);
            res.status(500).send('Error al registrar el factura');
            return;
        }
        res.redirect('/facturabo');
    });
});
// Leer (READ) - mostrar una factura en especifico
app.get('/facturabo/:id', (req, res) => {
    const id = req.params.id;
    
    const query = 'SELECT * FROM bodega WHERE idproducto = ?'; 
    conectar.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener los detalles de la factura');
        }

        if (result.length > 0) {
            res.render('detalleFactura', { facturab: result[0] }); 
        } else {
            res.status(404).send('Factura no encontrada');
        }
    });
});

//Actualizar (Update) - Mostrar formulario con los datos actuales
app.get('/facturabo/editar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('SELECT * FROM bodega WHERE idproducto = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la factura:', err.stack);
            res.status(500).send('Error al obtener la factura');
            return;
        }
        if (result.length ===0){
            return res.status(404).send('Factura no encontrada');
        }
        res.render('editarFactura', { facturab: result[0]});
    });
});
//Actualizar (Update) - guardar cambios en la base de datos
app.post('/facturabo/editar/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    conectar.query('UPDATE bodega SET ? WHERE idproducto = ?', [datosActualizados, id], (err, result) => {
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
app.post('/facturabo/eliminar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('DELETE FROM bodega WHERE idproducto = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la factura:', err.stack);
            res.status(500).send('Error al eliminar la factura');
            return;
        }
        console.log('Factura con ID ${id} eliminada exitosamente.')
        return res.send('Factura eliminada con exito');
    });
});
 // funcionalidad de los registros de facturas en el area de bodega
//Ruta para mostrar el formulario de registro de factura (GET)
app.get('/fac', (req, res) => {
    const filePath = path.join(__dirname, '../view', 'bodega.html');
    console.log(`Ruta absoluta del archivo: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log('Error al enviar el archivo:', err);
            res.status(404).send('Archivo no encontrado');
        }
    });
});

//ruta para procesar el formulario de factura (insercion en la base de datos)
app.post('/fac', (req, res) => {
    const {idproducto, marca, descripcion, cantidad, precio} = req.body;
    const INSERT_FACTURA_QUERY = `INSERT INTO bodega (idproducto, marca, descripcion, cantidad, precio) VALUES (?, ?, ?, ?, ?) `;
    

    conectar.query(INSERT_FACTURA_QUERY, [idproducto, marca, descripcion, cantidad, precio], (err, result) => {
     if (err) {
        console.error(err);
        res.status(500).send('Error al crear la factura');
         } else {
            console.log('Factura creada con exito');
            res.status(200).send('Factura creada con exito');
         }   
    });
});


//puerto donde correra el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

