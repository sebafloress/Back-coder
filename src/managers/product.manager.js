import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from 'path';

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getAll() {
        try {
            if (fs.existsSync(this.path)) {
                const products = await fs.promises.readFile(this.path, "utf-8");
                return JSON.parse(products);
            } else return [];
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async create(obj) {
        try {
            const requiredFields = ["title", "description", "code", "price", "stock", "category"];
            for (const field of requiredFields) {
                if (!obj[field]) throw new Error(`${field} is required`);
            }

            const product = {
                id: uuidv4(),
                ...obj,
                status: obj.status !== undefined ? obj.status : true,
                thumbnails: obj.thumbnails || []
            };

            const products = await this.getAll();
            products.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return product;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getById(id) {
        try {
            const products = await this.getAll();
            if (!products.length) throw new Error("No products found");
            const product = products.find(product => product.id === id);
            if (!product) throw new Error("Product not found");
            return product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async update(obj, id) {
        try {
            const products = await this.getAll();
            let product = await this.getById(id);


            product = { ...product, ...obj };

            const updatedProducts = products.map(prod => prod.id === id ? product : prod);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedProducts, null, 2));
            return product;
        } catch (error) {
            throw new Error(error);
        }
    }

    async delete(id) {
        try {
            const products = await this.getAll();
            const updatedProducts = products.filter(product => product.id !== id);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedProducts, null, 2));
            return { id };
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteAll() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify([]));
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const prodManager = new ProductManager(path.join(process.cwd(), "src/data/products.json"));
