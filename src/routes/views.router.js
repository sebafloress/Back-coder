import express from 'express';
import productManager from '../managers/product.manager.js';
const router = express.Router();

router.get('/home', (req, res) => {
    const products = productManager.getAllProducts();
    res.render('home', { products });
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

export default router;
