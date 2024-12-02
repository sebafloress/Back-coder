import Cart from '../models/cart.model.js';

class CartManager {
    async createCart() {
        const cart = new Cart();
        return await cart.save();
    }

    async getCartById(id) {
        return await Cart.findById(id).populate('products.productId');
    }

    async getCartByUserId(userId) {
        return await Cart.findOne({ userId }).populate('products.productId');
    }

    async addProductToCart(productId) {
        const cart = await Cart.findOne(); // Assuming a single cart for simplicity
        if (!cart) {
            const newCart = new Cart({ products: [{ productId, quantity: 1 }] });
            return await newCart.save();
        }
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ productId, quantity: 1 });
        }
        return await cart.save();
    }

    async saveProdToCart(cid, pid, quantity = 1) {
        const cart = await Cart.findById(cid);
        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ productId: pid, quantity });
        }
        return await cart.save();
    }

    async updateProductQuantity(cid, pid, quantity) {
        const cart = await Cart.findById(cid);
        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
        if (productIndex > -1) {
            cart.products[productIndex].quantity = quantity;
        }
        return await cart.save();
    }

    async removeProductFromCart(cid, pid) {
        const cart = await Cart.findById(cid);
        cart.products = cart.products.filter(p => p.productId.toString() !== pid);
        return await cart.save();
    }
}

export const cartManager = new CartManager();
