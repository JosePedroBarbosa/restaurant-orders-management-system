const express = require('express');
const router = express.Router();

const menuItemController = require('../controllers/menuItem.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const uploader = require('../lib/upload');

// Create, update and delete menu items
router.post('/createMenuItem', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant']), uploader.array('images', 5), menuItemController.createMenuItem);
router.put('/updateMenuItem/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), uploader.array('images', 5), menuItemController.updateMenuItem);
router.delete('/deleteMenuItem/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuItemController.deleteMenuItem);

// Add and remove portions from menu a specific menu item
router.post('/:menuItemId/addPortion', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuItemController.addPortion);
router.delete('/:menuItemId/removePortion/:portionId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuItemController.removePortion);

// get menu items from a specific restaurant id
router.get('/restaurant/:restaurantId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuItemController.getMenuItemsByRestaurant);

// get menu items and menu item by id
router.get('/myMenuItems',  authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant']), menuItemController.getMyMenuItems);
router.get('/menuItem/:id', menuItemController.getMenuItemById);

module.exports = router;