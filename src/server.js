// src/server.js
import express from 'express';
import { engine } from 'express-handlebars';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import viewsRouter from './routes/views.router.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';

// Obtener el directorio actual (__dirname equivalente)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Configuración del motor de plantillas Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket para actualizar la vista en tiempo real
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('newProduct', (product) => {
        io.emit('updateProducts', product);
    });

    socket.on('deleteProduct', (productId) => {
        io.emit('updateProducts', productId);
    });
});

// Iniciar el servidor en el puerto 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
