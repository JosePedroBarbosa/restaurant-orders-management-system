let mongoose = require("mongoose");

let restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true
    },
    address: {
        street: { type: String, default: null },
        city: { type: String, default: null },
        postalCode: { type: String, default: null },
    },  
    description: { type: String, default: null },  
    deliverySettings: {
        preparationTime: { type: Number, default: 30 },
        deliveryTime: { type: Number, default: 20 },
        maxDeliveryRadius: { type: Number, default: 5 },
        maxOrdersPerHour: { type: Number, default: 10 },
    },
    image: {
      type: String,
      default: null,
    },
    menus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu", // Referência aos menus
        default : [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);