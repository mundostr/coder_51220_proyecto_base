/*
PROYECTO BASE, INTEGRACION DE ELEMENTOS

## variables de entorno
## clases (manejo bbdd)
## clases (manejo fs)
## express rutas api rest
## express rutas estáticas
## socket.io servidor y cliente
## handlebars
## mongoose base, índices, paginate
mongoose population, aggregate
cookies
## sessions, primer autenticación básica de usuario
## autenticación con middleware

Los contenidos de prueba están generados con https://www.mockaroo.com/
*/

import {} from 'dotenv/config'

import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import session from 'express-session';

import mainRoutes from './api/main.routes.js';
import userRoutes from './api/users/users.routes.js';
import productRoutes from './api/products/products.routes.js';

import { __dirname } from './utils.js';

// recordar generar un archivo .env con las variables de entorno
// y utilizar la importación de dotenv config como primer línea arriba.
// Para evitar problemas, mantener el archivo .env en el directorio raíz (donde está el package.json)
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL || 'mongodb://127.0.0.1';
const SESSION_SECRET = process.env.SESSION_SECRET;
const BASE_URL = `http://localhost:${SERVER_PORT}`;
const PRODUCTS_PER_PAGE = 10;


// SERVIDOR EXPRESS y SOCKET.IO INTEGRADO
const app = express();
const server = http.createServer(app);
// Creamos nueva instancia para el servidor socket.io, activando módulo cors con acceso desde cualquier lugar (*)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }
});

// Parseo correcto
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestión de sesiones
app.use(session({
    secret: SESSION_SECRET,
    resave: true, // no caduca luego del tiempo de inactividad
    // resave: false,
    // cookie: { maxAge: 30 * 1000 }, // la sesión expira luego de 30 segundos de INACTIVIDAD
    saveUninitialized: true // se guarda el objeto de sesión aún estando vacío
}));

// Endpoints API REST
// "Inyectamos" el objeto io para poder utilizarlo en los endpoints
// En mainRoutes "inyectamos" también la cantidad de productos a mostrar por página
app.use('/', mainRoutes(io, BASE_URL, PRODUCTS_PER_PAGE));
app.use('/api', userRoutes(io));
app.use('/api', productRoutes(io));

// Contenidos estáticos
app.use('/public', express.static(`${__dirname}/public`));

// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

// EVENTOS SERVIDOR SOCKET.IO INTEGRADO
io.on('connection', (socket) => { // Escuchamos el evento connection por nuevas conexiones de clientes
    console.log(`Cliente conectado (${socket.id})`);
    
    // Emitimos el evento server_confirm
    socket.emit('server_confirm', 'Conexión recibida');
    
    socket.on('new_product_in_cart', (data) => {;
        // io.emit realiza un broadcast (redistribución) a TODOS los clientes, incluyendo el que lo generó
        io.emit('product_added_to_cart', data);
    });
    
    socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
    });
});


// ACTIVACION SERVIDOR GENERAL
try {
    await mongoose.connect(MONGOOSE_URL);
    
    server.listen(SERVER_PORT, () => {
        console.log(`Servidor iniciado en puerto ${SERVER_PORT}`);
    });
} catch(err) {
    console.log('No se puede conectar con el servidor de bbdd');
}