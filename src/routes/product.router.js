import { Router } from "express";
import productManager from '../managers/product.manager.js';

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, availability } = req.query;
        let filter = {};

        if (query) {
            filter.category = query;
        }

        if (availability) {
            filter.available = availability === 'available';
        }

        const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: sortOption,
        };

        const products = await productManager.getAll(filter, options);
        const totalProducts = await productManager.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const response = {
            status: 'success',
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}&availability=${availability}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}&availability=${availability}` : null,
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
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
