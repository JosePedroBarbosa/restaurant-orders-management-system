const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", // Referência ao restaurante
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        minlength: 8,
        maxLength: 255,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", 
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    nutritionalInfo: {
      type: new mongoose.Schema({
          calories: { type: Number, min: 0, required: true },
          proteins: { type: Number, min: 0, required: true },
          carbs: { type: Number, min: 0, required: true },
          fats: { type: Number, min: 0, required: true },
      }),
      required: true
    },
    portions: {
        type: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
          },
        ],
        required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);