import { Router } from "express";
import { prodManager } from "../managers/product.manager.js";

const router = Router();

router.get("/home", async (req, res) => {
    const products = await prodManager.getAll();
    res.render("home", { products });
});

router.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts");
});

export default router;
