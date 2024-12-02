import express from 'express';
import productManager from '../managers/product.manager.js';
import { cartManager } from '../managers/cart.manager.js';
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getAll();
        console.log('Productos obtenidos:', products); // Debugging line
        res.render('index', { products });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error al obtener productos');
    }
});

router.get('/home', async (req, res) => {
    try {
        const { query, limit = 10, page = 1 } = req.query;
        const filter = query ? { category: query } : {};
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit)
        };
        const products = await productManager.getAll(filter, options);
        const totalProducts = await productManager.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const response = {
            products,
            totalPages,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/home?limit=${limit}&page=${page - 1}&query=${query}` : null,
            nextLink: page < totalPages ? `/home?limit=${limit}&page=${page + 1}&query=${query}` : null,
            cartId: req.user ? (await cartManager.getCartByUserId(req.user._id))._id : null
        };

        console.log('Page:', page);
        console.log('Total Pages:', totalPages);

        res.render('home', response);
    } catch (error) {
        console.error('Error al obtener productos o carrito:', error);
        res.status(500).send('Error al obtener productos o carrito');
    }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productManager.getById(pid);
        res.render('productDetails', { product });
    } catch (error) {
        res.status(500).send('Error al obtener detalles del producto');
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartWithProducts(cid);
        res.render('cartDetails', { cart });
    } catch (error) {
        res.status(500).send('Error al obtener detalles del carrito');
    }
});

export default router;
