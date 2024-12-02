import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
