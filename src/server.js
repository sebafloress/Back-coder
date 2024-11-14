import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import userRouter from './routes/user.router.js';
import viewsRouter from './routes/views.router.js';
import productManager from './managers/product.manager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/users', userRouter);
app.use('/', viewsRouter);

app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    try {
        productManager.addProduct(newProduct);
        io.emit('updateProducts', productManager.getAllProducts()); // Emitir el evento a todos los clientes
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.emit('updateProducts', productManager.getAllProducts());

    socket.on('newProduct', (product) => {
        try {
            productManager.addProduct(product);
            io.emit('updateProducts', productManager.getAllProducts()); 
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    socket.on('deleteProduct', (productId) => {
        try {
            productManager.deleteProduct(productId);
            io.emit('updateProducts', productManager.getAllProducts()); 
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = 8080; 
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
