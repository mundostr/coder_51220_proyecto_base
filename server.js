import express from "express";
import rUsers from './api/users/users.routes.js';
import rProducts from './api/products/products.routes.js';
import { __dirname } from './utils.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';

const PORT = 3000;
const WS_PORT = 3050;

// Servidor Express base
const server = express();
const httpServer = server.listen(WS_PORT, () => {
    console.log(`Servidor socketio iniciado en puerto ${WS_PORT}`);
});
const io = new Server(httpServer, { cors: { origin: "http://localhost:3000" }});


server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Endpoints API REST
server.use('/api', rUsers);
server.use('/api', rProducts);

// Contenidos estáticos
server.use('/public', express.static(`${__dirname}/public`));

// Motor de plantillas
server.engine('handlebars', engine());
server.set('view engine', 'handlebars');
server.set('views', './views');

server.listen(PORT, () => {
    console.log(`Servidor base API / static iniciado en puerto ${PORT}`);
});

// Eventos socket.io
io.on('connection', (socket) => { // Escuchamos el evento connection por nuevas conexiones de clientes
    console.log(`Cliente conectado (${socket.id})`);
    
    // Emitimos el evento server_confirm
    socket.emit('server_confirm', 'Conexión recibida');
    
    socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
    });
    
    // Escuchamos por el evento evento_cl01 desde el cliente
    socket.on('event_cl01', (data) => {
        console.log(data);
    });
});
