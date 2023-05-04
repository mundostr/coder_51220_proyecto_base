import {} from 'dotenv/config'

import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';

import userRoutes from './api/users/users.routes.js';
import productRoutes from './api/products/products.routes.js';

import { __dirname } from './utils.js';

// recordar generar un archivo de entorno .env con la variable PORT
// y utilizar la importación de dotenv config como primer línea arriba
const PORT = parseInt(process.env.PORT || 3000);

// Servidor Express y Socket.io compartiendo puerto
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }
});

// Eventos socket.io
io.on('connection', (socket) => { // Escuchamos el evento connection por nuevas conexiones de clientes
    console.log(`Cliente conectado (${socket.id})`);
    
    // Emitimos el evento server_confirm
    socket.emit('server_confirm', 'Conexión recibida');
    
    socket.on('new_message', (data) => {;
        io.emit('msg_received', data); // io.emit realiza un broadcast (redistribución) a TODOS los clientes, incluyendo el que lo generó
    });
    
    socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
    });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints API REST
// "Inyectamos" el objeto io para poder utilizarlo en los endpoints
app.use('/api', userRoutes(io));
app.use('/api', productRoutes(io));

// Contenidos estáticos
app.use('/public', express.static(`${__dirname}/public`));

// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

server.listen(PORT, () => {
    console.log(`Servidor API/Socket.io iniciado en puerto ${PORT}`);
});
