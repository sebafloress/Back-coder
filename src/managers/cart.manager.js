import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import productManager from "./product.manager.js";

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async getAllCarts() {
        try {
            if (fs.existsSync(this.path)) {
                const carts = await fs.promises.readFile(this.path, "utf-8");
                return JSON.parse(carts);
            } else {
                return [];
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async createCart() {
        try {
            const cart = { id: uuidv4(), products: [] };
            const carts = await this.getAllCarts();
            carts.push(cart);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getCartById(id) {
        try {
            const carts = await this.getAllCarts();
            const cart = carts.find(cart => cart.id === id);
            if (!cart) throw new Error("Cart not found");
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }

    async saveProdToCart(idCart, idProd) {
        try {
            const productExists = await productManager.getById(idProd);
            if (!productExists) throw new Error('Product does not exist');

            let carts = await this.getAllCarts();
            const cart = await this.getCartById(idCart);
            if (!cart) throw new Error('Cart not found');

            const productInCart = cart.products.find(prod => prod.id === idProd);
            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ id: idProd, quantity: 1 });
            }

            const updatedCarts = carts.map(c => c.id === idCart ? cart : c);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedCarts, null, 2));
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const cartManager = new CartManager(path.join(process.cwd(), "src/data/carts.json"));
