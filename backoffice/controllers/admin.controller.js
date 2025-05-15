let User = require("../models/user");
let Category = require("../models/category");
let Menu = require("../models/menu");
let Restaurant = require("../models/restaurant");
let MenuItem = require("../models/menuItem");
let Order = require("../models/order");
let mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let adminController = {};

adminController.deleteMenuItemFromRestaurant = async (req, res) => {
  try {
    const menuItemId = req.params.id;
    const restaurantId = req.params.restaurantId;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({ message: "Invalid menuItem id format" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id format" });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "MenuItem not found" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (Array.isArray(menuItem.images)) {
      menuItem.images.forEach((imgPath) => {
        if (fs.existsSync(imgPath)) {
          fs.unlink(imgPath, (err) => {
            if (err) console.error(`Erro ao remover imagem: ${imgPath}`, err);
          });
        }
      });
    }

    // Remover o menu item de todos os menus
    await Menu.updateMany(
      { menuItems: menuItemId },
      { $pull: { menuItems: menuItemId } }
    );

    await MenuItem.findByIdAndDelete(menuItemId);
    res.status(200).json({
      message:
        "MenuItem deleted successfully, removed from restaurant and menus.",
      restaurantId,
    });
  } catch (error) {
    console.error("Error deleting menuItem:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.deleteMenuFromRestaurant = async (req, res) => {
  try {
    const menuId = req.params.id;
    const restaurantId = req.params.restaurantId;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res.status(400).json({ message: "Invalid menu id format" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id format" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Remover imagem associada ao menu
    if (menu.image && fs.existsSync(menu.image)) {
      fs.unlink(menu.image, (err) => {
        if (err) console.error("Erro ao remover imagem do menu:", err);
      });
    }

    await Menu.findByIdAndDelete(menuId);

    restaurant.menus = restaurant.menus.filter((id) => !id.equals(menuId));
    await restaurant.save();

    res.status(200).json({
      message: "Menu deleted from restaurant successfully",
      restaurantId,
    });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (name && name.length < 3) {
      return res
        .status(400)
        .json({ message: "Category name must be at least 3 characters long" });
    }

    const duplicatedCategory = await Category.findOne({ name });
    if (duplicatedCategory) {
      return res
        .status(400)
        .json({ message: "A category with that name already exists" });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    return res.status(201).json({
      message: "Category registered successfully",
      category: {
        _id: newCategory._id,
        name: newCategory.name,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.validateRestaurantById = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id format" });
    }

    const updatedRestaurant = await User.findByIdAndUpdate(
      restaurantId,
      { isValidated: true },
      { new: true, select: "-password" }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({
      message: "Restaurant validated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error validating restaurant:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.removeRestaurantById = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id format" });
    }

    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: "menus",
      populate: {
        path: "menuItems",
        model: "MenuItem",
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Apagar imagem do restaurante
    if (restaurant.image && fs.existsSync(restaurant.image)) {
      fs.unlink(restaurant.image, (err) => {
        if (err) console.error("Erro ao remover imagem do restaurante:", err);
      });
    }

    // Apagar menus e respetivos menuItems associados
    for (const menu of restaurant.menus || []) {
      // Apagar imagem do menu
      if (menu.image && fs.existsSync(menu.image)) {
        fs.unlink(menu.image, (err) => {
          if (err)
            console.error(`Erro ao remover imagem do menu ${menu._id}:`, err);
        });
      }

      for (const item of menu.menuItems || []) {
        if (!item) continue;

        try {
          // Remover imagens do menu item
          if (Array.isArray(item.images)) {
            for (const img of item.images) {
              if (fs.existsSync(img)) {
                fs.unlinkSync(img);
              }
            }
          }

          await MenuItem.findByIdAndDelete(item._id);
        } catch (err) {
          console.error(`Erro ao apagar menu item ${item._id}:`, err);
        }
      }

      try {
        await Menu.findByIdAndDelete(menu._id);
      } catch (err) {
        console.error(`Erro ao apagar menu ${menu._id}:`, err);
      }
    }

    // Apagar menuItems (não ligados a menus mas pertencentes ao restaurante)
    const orphanItems = await MenuItem.find({ restaurant: restaurantId });

    for (const item of orphanItems) {
      try {
        if (Array.isArray(item.images)) {
          for (const img of item.images) {
            if (fs.existsSync(img)) {
              fs.unlinkSync(img);
            }
          }
        }

        await MenuItem.findByIdAndDelete(item._id);
      } catch (err) {
        console.error(`Erro ao apagar menu item órfão ${item._id}:`, err);
      }
    }

    await Restaurant.findByIdAndDelete(restaurantId);

    return res.status(200).json({
      message: "Restaurant and all related data removed successfully",
      restaurantId,
    });
  } catch (error) {
    console.error("Error removing restaurant:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.removeCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category id format" });
    }

    const removedCategory = await Category.findByIdAndDelete(categoryId);
    if (!removedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res
      .status(200)
      .json({ message: "Category removed successfully", categoryId });
  } catch (error) {
    console.error("Error removing category:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getRestaurantsToValidate = async (req, res) => {
  try {
    const restaurants = await User.find({
      role: "restaurant",
      isValidated: false,
    }).select("_id userName fullName");
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching unvalidated restaurants:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .select("name address description deliverySettings image")
      .populate("owner", "name");
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

adminController.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().select("_id name");
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

adminController.getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find()
      .select("_id name description restaurant")
      .populate("restaurant", "name");
    res.status(200).json({ menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

adminController.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "fullName")
      .populate("restaurant", "name address")
      .populate("orderItems.menuItem", "name");

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.removeOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id format" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.review && order.review.photo) {
      const photoPath = path.join(__dirname, "..", order.review.photo);

      if (fs.existsSync(photoPath)) {
        try {
          fs.unlinkSync(photoPath);
          console.log(`Foto da review removida: ${photoPath}`);
        } catch (err) {
          console.error(`Erro ao remover a foto da avaliação: ${err.message}`);
        }
      }
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order and associated review photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getMonthlyOrdersCount = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          status: "delivered",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = Array(12).fill(0);
    stats.forEach((stat) => {
      result[stat._id - 1] = stat.total;
    });

    res.status(200).json({ monthlyOrders: result });
  } catch (error) {
    console.error("Error getting monthly orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.createRestaurantMenu = async (req, res) => {
  try {
    const { name, description, restaurantId } = req.body;

    if (!name || !description || !restaurantId || !req.file) {
      return res.status(400).json({
        message: "Name, description, restaurant ID, and menu image are required.",
      });
    }

    const image = req.file.path;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const duplicatedMenu = await Menu.findOne({
      restaurant: restaurant._id,
      name,
    });
    if (duplicatedMenu) {
      return res.status(400).json({
        message: "This restaurant already has a menu with this name.",
      });
    }

    const newMenu = new Menu({
      restaurant: restaurant._id,
      name,
      description,
      menuItems: [],
      image,
    });

    await newMenu.save();

    restaurant.menus.push(newMenu._id);
    await restaurant.save();

    return res.status(201).json({
      message: "Menu created successfully by admin.",
      menu: newMenu,
    });
  } catch (error) {
    console.error("Error creating menu as admin:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

adminController.getEligibleUsersForRestaurant = async (req, res) => {
  try {
    const eligibleUsers = await User.find({
      role: "restaurant",
      isValidated: true,
      _id: { $nin: await Restaurant.distinct('owner') }
    }).select("_id userName fullName");

    res.status(200).json({ eligibleUsers });
  } catch (error) {
    console.error("Error fetching eligible users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

adminController.createRestaurantForUser = async (req, res) => {
  try {
    const {
      name,
      description,
      street,
      city,
      postalCode,
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
      userId,
    } = req.body;

    if (
      !name ||
      !description ||
      !street ||
      !city ||
      !postalCode ||
      !maxDeliveryRadius ||
      !deliveryTime ||
      !maxOrdersPerHour ||
      !preparationTime ||
      !userId ||
      !req.file
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'restaurant' || user.isValidated === false) {
      return res.status(400).json({
        message: "User must exist, be validated and have role 'restaurant'.",
      });
    }

    const existingRestaurant = await Restaurant.findOne({ owner: userId });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ message: "This user already has a restaurant." });
    }

    const address = { street, city, postalCode };
    const deliverySettings = {
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
    };

    const restaurant = new Restaurant({
      name,
      description,
      address,
      deliverySettings,
      image: req.file.path,
      owner: user._id,
    });

    await restaurant.save();

    res.status(201).json({
      message: "Restaurant created successfully for user.",
      restaurant,
    });
  } catch (error) {
    console.error("Error creating restaurant for user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = adminController;