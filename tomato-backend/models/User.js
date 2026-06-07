const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    farmName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Prevents two accounts with the same email
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // We can add roles later if you want Admin vs Farmer access
    role: {
        type: String,
        default: 'farmer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);