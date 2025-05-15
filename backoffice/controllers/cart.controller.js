let mongoose = require("mongoose");
const Cart = require("../models/cart");
const MenuItem = require("../models/menuItem");
const Order = require("../models/order");

let cartController = {};

cartController.getPersonalCard = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    let cart = await Cart.findOne({ userId }).populate("items.menuItem");
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error getting personal card:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

cartController.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItem, portionName, portionPrice, quantity } = req.body;

    if (!menuItem || !portionName || !portionPrice || !quantity) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingMenuItem = await MenuItem.findById(menuItem);
    if (!existingMenuItem) {
      return res.status(404).json({ message: "Menu Item not found" });
    }

    const restaurantId = existingMenuItem.restaurant;

    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "MenuItem is not associated with any restaurant" });
    }

    if (quantity < 1 || portionPrice < 0) {
      return res
        .status(400)
        .json({ message: "Invalid quantity or portion price." });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    if (cart.items.length > 0) {
      const existingRestaurantId = cart.items[0].restaurantId.toString();
      if (existingRestaurantId !== restaurantId.toString()) {
        return res.status(400).json({
          message: "Cart can only contain items from one restaurant at a time",
        });
      }
    }

    const existingItem = cart.items.find(
      (item) =>
        item.menuItem.toString() === menuItem &&
        item.portionName === portionName
    );

    if (existingItem) {
      return res
        .status(400)
        .json({ message: "This item is already in the cart." });
    }

    const cartItem = {
      menuItem,
      portionName,
      portionPrice,
      quantity,
      restaurantId,
    };

    cart.items.push(cartItem);
    await cart.save();

    res.status(200).json({
      message: "Item added successfully.",
      cartItem,
      cart,
    });
  } catch (error) {
    console.error("Error adding item to card:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

cartController.updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId, portionName } = req.params;
    const { quantity } = req.body;
    const portionParam = portionName.trim().toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({ message: "Invalid MenuItem ID format" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemToUpdate = cart.items.find(
      (item) =>
        item.menuItem.toString() === menuItemId &&
        item.portionName.trim().toLowerCase() === portionParam
    );

    if (!itemToUpdate) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    itemToUpdate.quantity = quantity;

    await cart.save();

    res.status(200).json({
      message: "Quantity updated successfully",
      updatedItem: itemToUpdate,
      cart,
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

cartController.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId, portionName } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({ message: "Invalid MenuItem ID format" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.menuItem.toString() === menuItemId &&
          item.portionName === portionName
        )
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();

    res.status(200).json({
      message: "Item removed successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

cartController.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

cartController.submitOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role === "customer" && req.user.blockedUntil) {
      const now = new Date();
      const blockedUntil = new Date(req.user.blockedUntil);

      if (now < blockedUntil) {
        return res.status(403).json({
          message: `You are blocked from placing orders until ${blockedUntil.toLocaleDateString()}.`,
        });
      }
    }

    const cart = await Cart.findOne({ userId }).populate("items.menuItem");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    const {
      street,
      city,
      postalCode,
      deliveryType,
      paymentMethod,
      customerPhone,
      customerNote,
      citizenCardNumber,
    } = req.body;

    const restaurantId = cart.items[0].restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant information missing from cart items" });
    }

    const deliveryDetails = { street, city, postalCode };

    const orderItems = cart.items.map((item) => ({
      menuItem: item.menuItem._id,
      portionName: item.portionName,
      portionPrice: item.portionPrice,
      quantity: item.quantity,
      subtotal: item.quantity * item.portionPrice,
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Gerar código único (bom aspeto para o customer)
    let orderCode;
    let exists = true;

    do {
      orderCode = generateOrderCode();
      exists = await Order.exists({ orderCode });
    } while (exists);

    const newOrder = new Order({
      customer: userId,
      restaurant: restaurantId,
      orderItems,
      totalPrice,
      deliveryDetails,
      deliveryType,
      paymentMethod,
      customerPhone,
      customerNote,
      citizenCardNumber,
      orderCode,
      paymentStatus: "paid", // depois tirar estamos apenas a simular o pagamento.
    });

    await newOrder.save();

    const io = req.app.get("io");

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("customer", "fullName")
      .populate("restaurant", "name")
      .populate("orderItems.menuItem", "name");

    // Enviar para a página da order do cliente (sala da order)
    io.to(populatedOrder._id.toString()).emit("orderUpdated", {
      message: "Your order has been successfully placed!",
      order: populatedOrder,
    });

    io.to(restaurantId.toString()).emit("newOrder", {
      message: "New order received",
      order: populatedOrder,
    });

    // Limpar o carrinho
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder._id,
      orderCode: newOrder.orderCode, 
    });
  } catch (error) {
    console.error("Error submitting cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = cartController;
