/*
Integración de clases, express (api routes + estáticos), socket.io, handlebars, fs y mongoose
*/

import {} from 'dotenv/config'

import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';

import userRoutes from './api/users/users.routes.js';
import productRoutes from './api/products/products.routes.js';

import { __dirname } from './utils.js';

// recordar generar un archivo de entorno .env con la variable PORT
// y utilizar la importación de dotenv config como primer línea arriba
const PORT = parseInt(process.env.PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL;

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

// Parseo correcto de urls
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

// Activación del servidor
try {
    // mongodb+srv://coder51220:coder2023@cluster0.4qaobt3.mongodb.net/coder51220
    // mongodb://127.0.0.1:27017/coder51220
    await mongoose.connect(MONGOOSE_URL);
    
    server.listen(PORT, () => {
        console.log(`Servidor API/Socket.io iniciado en puerto ${PORT}`);
    });
} catch(err) {
    console.log('No se puede conectar con el servidor de bbdd');
}