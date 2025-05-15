const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        minlength: 8,
        maxLength: 255,
        default: null, 
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", // Referência ao restaurante
      required: true,
    },
    image: {
        type: String,
        default: null, 
    },
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem", 
        default: [],
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);