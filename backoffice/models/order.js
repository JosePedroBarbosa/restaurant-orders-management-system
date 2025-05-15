let mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  portionName: {
    type: String,
    required: true,
  },
  portionPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    orderItems: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'inProgress', 'outForDelivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryDetails: {
      street: { type: String, default: null },
      city: { type: String, default: null },
      postalCode: { type: String, default: null },
    },
    deliveryType: {
        type: String,
        enum: ['delivery', 'dineIn'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'subscription'],
        required: true
    },
    customerNote: {
      type: String,
      required: false,
      maxlength: 300
    },
    customerPhone: {
      type: String,
      required: false,
      match: [/^\+?\d{9,15}$/, "Invalid phone number format"]
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    citizenCardNumber: {
      type: String,
      required: false  
    },
    orderCode: {
      type: String,
      unique: true,
      required: true,
    },
    review: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String,
        photo: String,
        createdAt: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);