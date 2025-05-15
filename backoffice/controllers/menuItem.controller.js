const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/restaurant");
const Category = require("../models/category");
const Menu = require("../models/menu");
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

let menuItemController = {};

menuItemController.createMenuItem = async (req, res) => {
    try {
        const { name, description, category, calories, fats, proteins, carbs, portionName, portionPrice } = req.body;
        
        if(!name || !description || !category || !calories || !fats || !proteins || !carbs || !portionName || !portionPrice){
            return res.status(400).json({ message: "Missing required fields." });
        }

        const nutritionalInfo = {
            calories: parseFloat(calories),
            proteins: parseFloat(proteins),
            carbs: parseFloat(carbs),
            fats: parseFloat(fats),
        }

        const portions = [
            {
                name: portionName,
                price: parseFloat(portionPrice)
            }
        ]
        
        const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!existingRestaurant) {
            return res.status(409).json({ message: "You dont have a restaurant." });
        }

        const duplicatedMenuItem = await MenuItem.findOne({ restaurant: existingRestaurant._id, name });
        if(duplicatedMenuItem){
            return res.status(400).json({message: 'This restaurant already has a menuItem with this name'});
        }

        const newMenuItem = new MenuItem({
            restaurant: existingRestaurant._id,
            name,
            description,
            category,
            portions,
            nutritionalInfo,
            images: req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : []
        });

        await newMenuItem.save();

        const menuItemWithCategory = await MenuItem.findById(newMenuItem._id).populate('category', 'name');

        res.status(200).json({
            message: "Your menu was created successfully!",
            menuItem: {
                _id: newMenuItem._id,
                name: newMenuItem.name,
                description: newMenuItem.description,
                category: menuItemWithCategory.category, 
                nutritionalInfo: newMenuItem.nutritionalInfo,
                portions: newMenuItem.portions,
                images: newMenuItem.images
            },
        });

    } catch (error) {
        console.error("Error creating menu item:", error);   
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

menuItemController.updateMenuItem = async (req, res) => {
    try {
        const menuItemId = req.params.id;
        const { name, description, category, calories, proteins, carbs, fats, portions } = req.body;

        if(!name && !description && !category && !calories && !proteins && !carbs && !fats && !portions){
            return res.status(400).json({ message: "At least one field must be updated." });
        }

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ message: 'Invalid menu ID format' });
        }

        if (description && (description.length < 10 || description.length > 255)) {
            return res.status(400).json({ message: 'Description must be between 10 and 255 characters' });
        }

        const nutritionalInfo = { calories, proteins, carbs, fats };
        
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found' });
        }

        // Remover imagens antigas se novas imagens forem enviadas
        if (req.files && req.files.length > 0 && menuItem.images && menuItem.images.length > 0) {
        menuItem.images.forEach((imagePath) => {
            const fullImagePath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullImagePath)) {
                fs.unlinkSync(fullImagePath);
            }
        });
        }

        menuItem.name = name || menuItem.name;
        menuItem.description = description !== undefined ? description : menuItem.description;
        menuItem.category = category || menuItem.category;
        menuItem.nutritionalInfo = nutritionalInfo || menuItem.nutritionalInfo;
        menuItem.portions = portions || menuItem.portions;

        if (req.files && req.files.length > 0) {
            menuItem.images = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        await menuItem.save();

        res.status(200).json({
            message: 'MenuItem updated successfully',
            menuItemId
        });
    } catch (error) {
        console.error('Error updating menuItem:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
    
menuItemController.deleteMenuItem = async (req, res) => {
    try {
        const menuItemId = req.params.id;
    
            if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
                return res.status(400).json({ message: 'Invalid menuItem format' });
            }
    
            const menuItem = await MenuItem.findById(menuItemId);
            if (!menuItem) {
                return res.status(404).json({ message: 'MenuItem not found' });
            }
    
            const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) {
                return res.status(403).json({ message: 'You do not have permission to delete this menuItem' });
            }

             // Remover imagens associadas ao menuItem da pasta de uploads
            if (Array.isArray(menuItem.images)) {
                menuItem.images.forEach((imgPath) => {
                if (fs.existsSync(imgPath)) {
                    fs.unlink(imgPath, (err) => {
                    if (err) {
                        console.error(`Erro ao remover imagem: ${imgPath}`, err);
                    }
                    });
                }
                });
            }

            // Remover o item de todos os menus associados
            await Menu.updateMany(
                { menuItems: menuItemId },
                { $pull: { menuItems: menuItemId } }
              );
    
            await MenuItem.findByIdAndDelete(menuItemId);
    
            res.status(200).json({ message: 'MenuItem deleted successfully and removed from all menus' });
        } catch (error) {
            console.error('Error deleting menuItem:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
};  

menuItemController.addPortion = async (req, res) => {
    try {
        const menuItemId = req.params.menuItemId;
        const { portionName, portionPrice } = req.body;

        if(!portionName || !portionPrice) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ message: 'Invalid menuItem ID format' });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found' });
        }

        const newPortion = {
            name: portionName,
            price: parseFloat(portionPrice)
        };

        menuItem.portions.push(newPortion);
        await menuItem.save();

        res.status(200).json({
            message: "Portion was created successfully!",
            menuItemId
        });
    } catch (error) {
        console.error('Error removing portion:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

menuItemController.removePortion = async (req, res) => {
    try {
        const menuItemId = req.params.menuItemId;
        const portionId = req.params.portionId;

        if (!mongoose.Types.ObjectId.isValid(menuItemId) || !mongoose.Types.ObjectId.isValid(portionId)) {
            return res.status(400).json({ message: 'Invalid menuItem or portion ID format' });
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found' });
        }

        menuItem.portions = menuItem.portions.filter(portion => portion._id.toString() !== portionId);
        await menuItem.save();

        res.status(200).json({ message: 'Portion removed successfully', menuItem });
    } catch (error) {
        console.error('Error removing portion:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

menuItemController.getMenuItemById = async (req, res) => {
    try {
        const menuItemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({ message: 'Invalid menuItem ID format' });
        }

        const menuItem = await MenuItem.findById(menuItemId)
        .populate({ path: 'restaurant', select: 'name location' })
        .populate({ path: 'category', select: 'name description' });
  
        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found' });
        }

        const categories = await Category.find().select('_id name');

        return res.status(200).json({ menuItem, categories });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

menuItemController.getMenuItemsByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(400).json({ message: 'Invalid restaurant ID' });
      }
  
      const menuItems = await MenuItem.find({ restaurant: restaurantId }).select(
        '_id name description category images nutritionalInfo portions'
      );
  
      return res.status(200).json({
        menuItems,
        count: menuItems.length
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
menuItemController.getMyMenuItems = async (req, res) => {
    try {
        const userId = req.user._id;

        const existingRestaurant = await Restaurant.findOne({ owner: userId });
        if (!existingRestaurant) {
          return res.status(409).json({ message: "You dont have a restaurant." });
        }

        const menuItems = await MenuItem.find({ restaurant: existingRestaurant._id }).select('_id name description menuItems');

        res.status(200).json({
            menuItems,
            count: menuItems.length
        });
    }catch(error){
        console.error('Error fetching menus:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = menuItemController;