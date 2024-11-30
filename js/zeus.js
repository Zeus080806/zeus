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

// mostrar interfaz principal de gestion humana 
app.get('/', (req, res) => {
    console.log('Ruta fue accedida');
     const filePath = path.join(__dirname, '../view','principalges.html');
     console.log(`Ruta absoluta del archivo: ${filePath}`);
     res.sendFile(filePath, (err) => {
         if (err) {
             console.log('Error al enviar el archivo:', err);
             res.status(404).send('Archivo no encontrado');
         }
     });
 });

  // mostrar resgistro de funcionarios
 app.get('/fun', (req, res) => {
    const filePath = path.join(__dirname, '../view','funcionario.html');
     console.log(`Ruta absoluta del archivo: ${filePath}`);
     res.sendFile(filePath, (err) => {
         if (err) {
             console.log('Error al enviar el archivo:', err);
             res.status(404).send('Archivo no encontrado');
         }
     });
 });

//Crear (CREATE) - mostrar formulario de nuevo funcionario 
app.get('/funcionarios/nuevo', (req, res) => {
    res.render('nuevofuncionario');
 });


//Leer (READ) -  mostrar listado de todos los funcionarios
app.get('/funcionarios', (req, res) => {
    conectar.query('SELECT * FROM gestionh', (err, results) => {
        if (err) {
           console.error('Error al obtener los funcionarios:', err.stack);
            res.status(500).send('Error al obtener los funcionarios');
            return;
       }
       console.log(results);
       res.render('listadoFuncionarios', { funcionarios: results});
    });
});

//Crear (CREATE) - guardar en la base de datos en el mismo listado
app.post('/funcionarios', (req, res) => {
    const nuevofuncionario = req.body;
    conectar.query('INSERT INTO gestionh SET ?', nuevofuncionario, (err, result) => {
        if (err) {
            console.error('Error al insertar funcionario:', err.stack);
            res.status(500).send('Error al registrar el funcionario');
            return;
        }
        res.redirect('/funcionarios');
    });
});

// Leer (READ) - mostrar un funcionario especifico
app.get('/funcionarios/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('SELECT * FROM gestionh WHERE idusuario = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el funcionario:', err.stack);
            res.status(500).send('Error al obtener el funcioanrio');
            return;
        }
        if(result.length === 0) {
            return res.status(400).send('Funcionario no encontrado');
        }
        res.render('detalleFuncionario', { funcionario: result[0] });
    });
});

//Actualizar (Update) - Mostrar formulario con los datos actuales
app.get('/funcionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('SELECT * FROM gestionh  WHERE idusuario = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el funcioanrio:', err.stack);
            res.status(500).send('Error al obtener el funcionario');
            return;
        }
        if (result.length ===0){
            return res.status(404).send('Funcionario no encontrado');
        }
        res.render('editarFuncionario', { funcionario: result[0]});
    });
});

//Actualizar (Update) - guardar cambios en la base de datos
app.post('/funcionarios/editar/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    conectar.query('UPDATE gestionh SET ? WHERE idusuario = ?', [datosActualizados, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar funcionario:', err.stack);
            res.status(500).json({error: 'Error al actualizar el funcionario'});
            return;
        }
        console.log('Cambios guardados');
        return res.send('Cambios guardados exitosamente');
    });
});

//Eliminar (DELETE)
app.post('/funcionarios/eliminar/:id', (req, res) => {
    const id = req.params.id;
    conectar.query('DELETE FROM gestionh WHERE idusuario = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar funcionario:', err.stack);
            res.status(500).send('Error al eliminar el funcionario');
            return;
        }
        console.log('Funcionario con ID ${id} eliminado exitosamente.')
        res.redirect('/funcionarios');
    });
});

//funcionalidad de los registros de los funcionarios.
//ruta para manejar el registro de funcionarios (POST)
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

        //crear objeto de funcionarios para insertar en la base de datos
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

//iniciar el servidor 
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});