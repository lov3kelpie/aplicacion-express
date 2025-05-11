//Importamos las librarías requeridas
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json()


// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});

//Creamos un endpoint de login que recibe los datos como json
app.post('/insert', jsonParser, function (req, res) {
    //Imprimimos el contenido del campo todo
    const { todo } = req.body;
   
    console.log(todo);
    res.setHeader('Content-Type', 'application/json');
    

    if (!todo) {
        res.status(400).send('Falta información necesaria');
        return;
    }
    const stmt  =  db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');

    stmt.run(todo, (err) => {
        if (err) {
          console.error("Error running stmt:", err);
          res.status(500).send(err);
          return;

        } else {
          console.log("Insert was successful!");
        }
    });

    stmt.finalize();

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.status(201).send();
})

    // **ENDPOINT "agrega_todo"
    app.post('/agrega_todo', jsonParser, function (req, res) {
        // Imprimimos el contenido del campo todo recibido
        const { todo } = req.body;
        console.log('Todo recibido en /agrega_todo:', todo);
    
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Para permitir todas las solicitudes (no recomendado en producción)
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Métodos permitidos
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Cabeceras permitidas
    
        if (!todo) {
            res.status(400).send('Falta el campo "todo" en la petición');
            return;
        }
    
        const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');
        stmt.run(todo, (err) => {
            if (err) {
                console.error("Error al insertar en la base de datos:", err);
                res.status(500).send('Error al guardar el todo');
                return;
            } else {
                console.log("Todo agregado correctamente:", todo);
                res.status(201).json({ message: 'Todo agregado correctamente' });
            }
        });
        stmt.finalize();
    });

app.get('/', function (req, res) {
    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok2' }));
})

// Nuevo endpoint para obtener la lista de todos
app.get('/todos', function (req, res) {
    db.all('SELECT id, todo, created_at FROM todos', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.json(rows);
    });
});

//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
    //Imprimimos el contenido del body
    console.log(req.body);

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
})

//Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})
