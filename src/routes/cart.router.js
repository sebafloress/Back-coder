import { Router } from "express";
import { cartManager } from "../managers/cart.manager.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        res.status(200).json(cart.products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/api/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartWithProducts(cid);
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.saveProdToCart(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/api/carts/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        await cartManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).json({ status: 'success', message: 'Cantidad de producto actualizada' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.removeProductFromCart(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        await cartManager.removeProductFromCart(cid, pid);
        res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/api/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        await cartManager.clearCart(cid);
        res.status(200).json({ status: 'success', message: 'Todos los productos eliminados del carrito' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/api/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        await cartManager.updateCart(cid, products);
        res.status(200).json({ status: 'success', message: 'Carrito actualizado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/api/carts/add/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const cart = await cartManager.addProductToCart(pid);
        res.status(200).json({ status: 'success', message: 'Producto agregado al carrito', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
