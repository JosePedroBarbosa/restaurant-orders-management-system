const Restaurant = require("../models/restaurant");
const MenuItem = require("../models/menuItem");
const mongoose = require("mongoose");
const Category = require("../models/category");
const Menu = require("../models/menu");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");

let restaurantController = {};

restaurantController.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      street,
      city,
      postalCode,
      description,
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
    } = req.body;

    if (
      !name ||
      !street ||
      !city ||
      !postalCode ||
      !description ||
      !maxDeliveryRadius ||
      !deliveryTime ||
      !maxOrdersPerHour ||
      !preparationTime ||
      !req.file
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const image = req.file.path;

    const address = { street, city, postalCode };
    const deliverySettings = {
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
    };

    const existingRestaurant = await Restaurant.findOne({
      owner: req.user._id,
    });
    if (req.user.role === "admin") {
      // admin pode criar vários restaurantes — prosseguir sem restrições
    } else if (req.user.role === "restaurant") {
      // restaurante apenas pode criar um restaurante
      if (existingRestaurant) {
        return res
          .status(400)
          .json({ message: "You can only have one restaurant!" });
      }
    }

    const restaurantData = {
      name,
      description,
      address,
      deliverySettings,
      image,
    };

    const restaurant = new Restaurant(restaurantData);
    restaurant.owner = req.user._id;

    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

restaurantController.updateRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    let data = req.body;
    if (req.body.data) {
      data = JSON.parse(req.body.data);
    }

    const {
      name,
      street,
      city,
      postalCode,
      description,
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
    } = data;

    const address = { street, city, postalCode };
    const deliverySettings = {
      maxDeliveryRadius,
      deliveryTime,
      maxOrdersPerHour,
      preparationTime,
    };

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID format" });
    }

    if (
      !name &&
      !street &&
      !city &&
      !postalCode &&
      !description &&
      !maxDeliveryRadius &&
      !deliveryTime &&
      !maxOrdersPerHour &&
      !preparationTime &&
      !req.file
    ) {
      return res
        .status(400)
        .json({ message: "At least one field is required for update." });
    }

    //validar se o restaurant com o id passado existe.
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Verificar permissões consoante a role
    if (req.user.role === "admin") {
      // admin pode editar qualquer restaurante — prosseguir sem restrições
    } else if (req.user.role === "restaurant") {
      // restaurante apenas pode editar o seu próprio restaurante
      if (restaurant.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You do not have permission to update this restaurant",
        });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verificar se o restaurante tem uma imagem antiga e removê-la (lixo na pasta uploads)
    if (req.file && restaurant.image) {
      const oldImagePath = path.join(__dirname, "..", restaurant.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (description) updateData.description = description;
    if (deliverySettings) updateData.deliverySettings = deliverySettings;
    if (req.file) updateData.image = req.file.path;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

restaurantController.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .select("name address description deliverySettings image")
      .populate("owner", "name");

    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).render("error", { message: "Erro Interno do Servidor" });
  }
};

restaurantController.getRestaurantById = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID format" });
    }

    const restaurant = await Restaurant.findById(restaurantId)
      .select("name address description deliverySettings menus image")
      .populate({
        path: "menus",
        select: "name description image",
        populate: {
          path: "menuItems",
          select: "name description category images nutritionalInfo portions",
        },
      })
      .populate("owner", "name");

    if (!restaurant) {
      return res
        .status(404)
        .render("error", { message: "Restaurant not found" });
    }

    const allMenuItems = await MenuItem.find({
      restaurant: restaurantId,
    }).select("name description category images nutritionalInfo portions");

    const restaurantObject = restaurant.toObject();
    restaurantObject.allMenuItems = allMenuItems;

    res.status(200).json(restaurantObject);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

restaurantController.getUpdateRestaurantData = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const categories = await Category.find().select("_id name");
    const menus = await Menu.find({ restaurant: restaurant._id }).select(
      "_id name description"
    );
    const menuItems = await MenuItem.find({ restaurant: restaurant._id })
      .select("_id name description category images nutritionalInfo portions")
      .populate("category", "name");

    return res.status(200).json({
      restaurant,
      user: req.user,
      categories,
      menus,
      menuItems,
    });
  } catch (error) {
    console.error("Error fetching update data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

restaurantController.getRestaurantReviewStats = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const result = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          "review.rating": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$review.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({ averageRating: 0, totalReviews: 0 });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error calculating restaurant review stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = restaurantController;
