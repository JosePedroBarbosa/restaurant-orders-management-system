const Menu = require("../models/menu");
const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/restaurant");
const Category = require("../models/category");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let menuController = {};

menuController.createMenu = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description || !req.file) {
      return res
        .status(400)
        .json({ message: "Name, description and menu image are required." });
    }

    const image = req.file.path;

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user._id,
    });
    if (!existingRestaurant) {
      return res.status(409).json({ message: "You dont have a restaurant." });
    }

    const duplicatedMenu = await Menu.findOne({
      restaurant: existingRestaurant._id,
      name,
    });
    if (duplicatedMenu) {
      return res
        .status(400)
        .json({ message: "This restaurant already has a menu with this name" });
    }

    const newMenu = new Menu({
      restaurant: existingRestaurant._id,
      name,
      description: description,
      menuItems: [],
      image,
    });

    await newMenu.save();

    existingRestaurant.menus.push(newMenu._id);
    await existingRestaurant.save();
    res.status(201).json({
      message: "Menu created successfully",
      menu: newMenu,
    });
  } catch (error) {
    console.error("Error creating menu:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.updateMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res.status(400).json({ message: "Invalid menu ID format" });
    }

    if (name && name.length < 3) {
      return res
        .status(400)
        .json({ message: "Menu name must be at least 3 characters long" });
    }

    if (
      description !== undefined &&
      (description.length < 10 || description.length > 255)
    ) {
      return res
        .status(400)
        .json({ message: "Description must be between 10 and 255 characters" });
    }

    const menu = await Menu.findById(menuId).populate("restaurant");
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (req.user.role === "admin") {
      // admin pode editar qualquer menu
    } else if (req.user.role === "restaurant") {
      if (menu.restaurant.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You do not have permission to update this menu" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (name && name !== menu.name) {
      const existingMenu = await Menu.findOne({
        restaurant: menu.restaurant._id,
        name,
      });
      if (existingMenu) {
        return res
          .status(400)
          .json({
            message: "This restaurant already has a menu with this name",
          });
      }
    }

    if (!name && !description && !req.file) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Remover a imagem antiga se uma nova imagem for enviada
    if (req.file && menu.image) {
      const oldImagePath = path.join(__dirname, "..", menu.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    menu.name = name || menu.name;
    menu.description =
      description !== undefined ? description : menu.description;
    menu.image = req.file ? req.file.path : menu.image;

    await menu.save();

    res.status(200).json({
      message: "Menu updated successfully",
      menu,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res.status(400).json({ message: "Invalid menu ID format" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    let restaurant = null;

    if (req.user.role === "admin") {
      // admin pode eliminar qualquer menu
      restaurant = await Restaurant.findOne({ menus: menuId });
    } else if (req.user.role === "restaurant") {
      restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || !restaurant.menus.includes(menuId)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to delete this menu" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Eliminar o ficheiro de imagem, se existir
    if (menu.image && fs.existsSync(menu.image)) {
      fs.unlink(menu.image, (err) => {
        if (err)
          console.error("Error while removing image from the menu:", err);
      });
    }

    await Menu.findByIdAndDelete(menuId);

    if (restaurant) {
      restaurant.menus = restaurant.menus.filter((id) => !id.equals(menuId));
      await restaurant.save();
    }

    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.getMyMenus = async (req, res) => {
  try {
    const userId = req.user._id;

    const existingRestaurant = await Restaurant.findOne({ owner: userId });
    if (!existingRestaurant) {
      return res.status(409).json({ message: "You dont have a restaurant." });
    }

    const menus = await Menu.find({
      restaurant: existingRestaurant._id,
    }).select("_id name description menuItems");

    res.status(200).json({
      menus,
      count: menus.length,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.getMenuById = async (req, res) => {
  try {
    const menuId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res.status(400).json({ message: "Invalid menu ID format" });
    }

    const menu = await Menu.findById(menuId)
      .populate({
        path: "menuItems",
        select: "name description category images nutritionalInfo portions",
        populate: {
          path: "category",
          select: "name description",
        },
      })
      .populate({
        path: "restaurant",
        select: "_id name",
      });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.addMenuItem = async (req, res) => {
  try {
    const menuId = req.params.menuId;
    const menuItemId = req.body.menuItemId;

    if (
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid menu or menu item ID format" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menu.menuItems.includes(menuItemId)) {
      return res
        .status(400)
        .json({ message: "This item is already in the menu" });
    }

    //validar se o menu atingiu o limite de pratos.
    if (menu.menuItems.length >= 10) {
      return res
        .status(400)
        .json({
          message: "This menu already has 10 Menu Items! Max limit reached.",
        });
    }

    menu.menuItems.push(menuItemId);
    await menu.save();

    res.status(200).json({
      message: "Menu item added successfully",
      menuId: menu._id,
      menuItemId: menuItemId,
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.removeMenuItem = async (req, res) => {
  try {
    const menuId = req.params.menuId;
    const menuItemId = req.params.itemId;

    if (
      !mongoose.Types.ObjectId.isValid(menuId) ||
      !mongoose.Types.ObjectId.isValid(menuItemId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (!menu.menuItems.includes(menuItemId)) {
      return res.status(400).json({ message: "This item is not in the menu" });
    }

    menu.menuItems = menu.menuItems.filter(
      (item) => item.toString() !== menuItemId
    );
    await menu.save();

    res.status(200).json({
      message: "Menu item removed successfully",
      menuId: menu._id,
    });
  } catch (error) {
    console.error("Error removing menu item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.getFilters = async (req, res) => {
  try {
    const categories = await Category.find().select("_id name");
    const restaurants = await Restaurant.find().select("_id name address");

    res.status(200).json({
      categories,
      restaurants,
    });
  } catch (error) {
    console.error("Error loading filters:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

menuController.searchMenuItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, restaurant, location, name } =
      req.query;

    let query = {};

    if (category) {
      const categoryDoc = await Category.findOne({
        name: { $regex: category, $options: "i" },
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (minPrice || maxPrice) {
      query["portions.price"] = {};
      if (minPrice) query["portions.price"].$gte = parseFloat(minPrice);
      if (maxPrice) query["portions.price"].$lte = parseFloat(maxPrice);
    }

    if (restaurant) {
      const restaurantDoc = await Restaurant.findOne({
        name: { $regex: restaurant, $options: "i" },
      });
      if (restaurantDoc) {
        query.restaurant = restaurantDoc._id;
      }
    }

    if (location) {
      const restaurantsInLocation = await Restaurant.find({
        "address.city": { $regex: location, $options: "i" },
      }).select("_id");
      query.restaurant = { $in: restaurantsInLocation.map((r) => r._id) };
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name")
      .populate("restaurant", "name address")
      .limit(50);

    res.status(200).json({
      menuItems,
      count: menuItems.length,
    });
  } catch (error) {
    console.error("Error searching menu items:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = menuController;
