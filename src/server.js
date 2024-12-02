import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import Product from './models/product.model.js';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from './models/user.model.js';
import flash from 'connect-flash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mongoURI = 'mongodb+srv://sebaflores:mica4262@cluster0.zbmkf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI).then(() => {
    console.log('Conectado a MongoDB Atlas');
    // Ejemplo de consulta para verificar la conexión
    Product.find().then(products => {
        console.log('Productos en la base de datos:', products);
    }).catch(err => {
        console.error('Error al obtener productos:', err);
    });
}).catch(err => {
    console.error('Error al conectar a MongoDB Atlas:', err);
});

// Verify database connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';
import productManager from './managers/product.manager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

// Passport configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    console.log('Authenticating user:', username); // Debug log
    try {
      const user = await User.findOne({ username });
      if (!user) {
        console.log('User not found'); // Debug log
        return done(null, false, { message: 'Incorrect username.' });
      }
      // Add password validation logic here
      if (user.password !== password) { // Simple password check, replace with bcrypt in production
        console.log('Incorrect password'); // Debug log
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('User authenticated successfully'); // Debug log
      return done(null, user);
    } catch (err) {
      console.error('Error during authentication:', err); // Debug log
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

function authMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.use('/home', viewsRouter);
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

app.get('/cart', (req, res) => {
    res.render('cart');
});

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    try {
        const products = await productManager.getAll();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }

    socket.on('newProduct', async (product) => {
        try {
            await productManager.create(product);
            const products = await productManager.getAll();
            io.emit('updateProducts', products); 
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            const products = await productManager.getAll();
            io.emit('updateProducts', products); 
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
