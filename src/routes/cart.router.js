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

router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.saveProdToCart(cid, pid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
