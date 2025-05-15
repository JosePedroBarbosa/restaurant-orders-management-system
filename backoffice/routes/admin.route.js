let express = require('express');
let router = express.Router();

let adminController = require('../controllers/admin.controller');
let authMiddleware = require('../middlewares/auth.middleware');
let roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../lib/upload');

// get operations to display all restaurants, categories and menus in the admin dashboard
router.get('/getAllRestaurants', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getAllRestaurants);
router.get('/getAllCategories', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getAllCategories);
router.get('/getAllMenus', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getAllMenus);
router.get('/getAllOrders', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getAllOrders);

// get restaraunts to validate and validate restaurant by id
router.get('/restaurantsToValidate', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getRestaurantsToValidate);
router.post('/validateRestaurant/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.validateRestaurantById);

// to remove restaurant and all associated menus and menuItems from the database
router.delete('/removeRestaurant/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.removeRestaurantById);

// operations to create and remove categories
router.post('/createCategory', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.createCategory);
router.delete('/removeCategory/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.removeCategoryById);

// operations to delete menus and menu items from a specific restaurant
router.delete('/deleteMenu/:restaurantId/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.deleteMenuFromRestaurant);
router.delete('/deleteMenuItem/:restaurantId/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.deleteMenuItemFromRestaurant);

router.delete('/removeOrder/:orderId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.removeOrderById);

router.get('/monthlyOrders', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getMonthlyOrdersCount);

//create menu for a specific restaurant (admin only)
router.post('/createRestaurantMenu', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), upload.single('image'), adminController.createRestaurantMenu);

//get eligible users to create a restaurant
router.get('/eligibleUsersForRestaurant', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), adminController.getEligibleUsersForRestaurant);

//create restaurant for a specific user, role restaurant validated and without a created restaurant (admin only)
router.post('/createRestaurantAsAdmin', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['admin']), upload.single("image"), adminController.createRestaurantForUser);


module.exports = router;