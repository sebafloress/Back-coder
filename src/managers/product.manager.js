import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, '../data/products.json');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    loadProducts() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            return [];
        }
    }

    saveProducts(products) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(products, null, 2), 'utf-8');
        } catch (error) {
            console.error("Error al guardar productos:", error);
        }
    }

    getAllProducts() {
        return this.loadProducts();
    }

    getProductById(id) {
        const products = this.loadProducts();
        return products.find(product => product.id === id);
    }

    addProduct(newProduct) {
        const products = this.loadProducts();

        if (!newProduct.name || !newProduct.price) {
            throw new Error("El producto debe tener un nombre y un precio.");
        }

        newProduct.id = Date.now();

        products.push(newProduct);
        this.saveProducts(products);

        return newProduct;
    }

    updateProduct(id, updatedData) {
        const products = this.loadProducts();
        const productIndex = products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            throw new Error("Producto no encontrado.");
        }

        products[productIndex] = { ...products[productIndex], ...updatedData };
        this.saveProducts(products);

        return products[productIndex];
    }

    deleteProduct(id) {
        let products = this.loadProducts();
        const initialLength = products.length;
        products = products.filter(product => product.id !== id);

        if (products.length === initialLength) {
            throw new Error("Producto no encontrado.");
        }

        this.saveProducts(products);
        return true;
    }
}

const productManager = new ProductManager(filePath);

export default productManager;
