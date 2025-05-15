let mongoose = require("mongoose");
const Order = require("../models/order");
const Restaurant = require("../models/restaurant");
const User = require("../models/user");

let orderController = {};

orderController.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(orderId)
      .populate("customer", "fullName")
      .populate("restaurant", "name")
      .populate("orderItems.menuItem", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

orderController.getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID format" });
    }

    const orders = await Order.find({
      restaurant: restaurantId,
      status: { $nin: ["delivered", "cancelled"] },
    })
      .populate({
        path: "customer",
        select: "fullName",
      })
      .populate({
        path: "restaurant",
        select: "name",
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

orderController.getRestaurantOrdersHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const restaurant = await Restaurant.findOne({ owner: userId });
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant not found for this user" });
    }

    const orders = await Order.find({
      restaurant: restaurant._id,
      status: { $in: ["delivered", "cancelled"] },
    })
      .populate({
        path: "customer",
        select: "fullName",
      })
      .populate({
        path: "restaurant",
        select: "name",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

orderController.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const statusLabels = [
      "pending",
      "confirmed",
      "inProgress",
      "outForDelivery",
      "delivered",
      "cancelled",
    ];

    if (!statusLabels.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Se for cliente e estiver a cancelar, registar no cancelHistory
    if (req.user.role === "customer" && status === "cancelled") {
      const user = await User.findById(req.user._id); 

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.cancelHistory.push({ date: new Date() });

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const cancelThisMonth = user.cancelHistory.filter((c) => {
        const date = new Date(c.date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      if (cancelThisMonth.length >= 5) {
        const twoMonthsLater = new Date();
        twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
        user.blockedUntil = twoMonthsLater;
      }

      await user.save();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = req.app.get("io");
    const statusLabel =
      statusLabels[updatedOrder.status] || updatedOrder.status;

    // Notificar o cliente
    io.to(orderId.toString()).emit("orderUpdated", {
      message: `Order status changed to ${statusLabel}`,
      order: updatedOrder,
    });

    // Notificar o restaurante(dashboard)
    io.to(updatedOrder.restaurant.toString()).emit(
      "orderUpdatedForRestaurant",
      {
        message: `Order ${updatedOrder._id} was ${statusLabel.toLowerCase()}.`,
        order: updatedOrder,
      }
    );

    return res
      .status(200)
      .json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

orderController.getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({
      customer: userId,
      status: { $in: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name");

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching user order history:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

orderController.reviewOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.review && order.review.rating) {
      return res
        .status(400)
        .json({ message: "Review has already been submitted for this order." });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "You can only review a delivered order." });
    }

    const { rating, comment } = req.body;
    const photo = req.file ? req.file.path : null;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required." });
    }

    order.review = {
      rating,
      comment,
      photo,
      createdAt: new Date(),
    };

    await order.save();

    return res.status(200).json({
      message: "Review submitted successfully.",
      review: order.review,
    });
  } catch (error) {
    console.error("Error reviewing order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = orderController;
