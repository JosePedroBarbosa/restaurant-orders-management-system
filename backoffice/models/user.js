const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        minlength: 6
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    fullName: {
        type: String,
        required: true,
    },
    address: {  
        street: { type: String, default: null },
        city: { type: String, default: null },
        postalCode: { type: String, default: null },
    },
    role: {
        type: String,
        enum: ['customer', 'restaurant', 'admin'],
        required: true,
    },
    isValidated: {
        type: Boolean,
        default: false,
    },
    cancelHistory: [
        {
            date: { type: Date, required: true }
        }
    ],
    blockedUntil: {
        type: Date,
        default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);