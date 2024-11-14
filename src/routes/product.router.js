import { Router } from "express";
import productManager from '../managers/product.manager.js';

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { limit } = req.query;
        const products = await productManager.getAll();
        const limitedProducts = limit ? products.slice(0, limit) : products;
        res.status(200).json(limitedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getById(pid);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const requiredFields = ["title", "description", "code", "price", "stock", "category"];
        for (const field of requiredFields) {
            if (!req.body[field]) return res.status(400).json({ message: `${field} is required` });
        }
        
        const productData = {
            ...req.body,
            status: req.body.status !== undefined ? req.body.status : true,
            thumbnails: req.body.thumbnails || []
        };
        
        const product = await productManager.create(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await productManager.update(req.body, pid);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.delete(pid);
        res.status(200).json({ message: `Product id: ${deletedProduct.id} deleted successfully` });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

export default router;
