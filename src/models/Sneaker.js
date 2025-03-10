import mongoose from 'mongoose';

const SneakerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true,
        minlength: [2, 'Brand must be at least 2 characters long']
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true,
        minlength: [2, 'Model must be at least 2 characters long']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true
    },
    size: {
        type: Number,
        required: [true, 'Size is required'],
        min: [4, 'Size must be at least 4'],
        max: [18, 'Size cannot be greater than 18']
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Prevent mongoose from creating a model multiple times during hot reloading
const Sneaker = mongoose.models.Sneaker || mongoose.model('Sneaker', SneakerSchema);

export default Sneaker;
