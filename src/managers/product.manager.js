import Product from '../models/product.model.js';

class ProductManager {
    async getAll(query = {}, options = {}) {
        return await Product.find(query, null, options);
    }

    async getById(id) {
        return await Product.findById(id);
    }

    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async update(productData, id) {
        return await Product.findByIdAndUpdate(id, productData, { new: true });
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }

    async countDocuments(query = {}) {
        return await Product.countDocuments(query);
    }
}

const productManager = new ProductManager();
export default productManager;
