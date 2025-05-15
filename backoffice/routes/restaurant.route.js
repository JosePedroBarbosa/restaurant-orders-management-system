const express = require('express');
const router = express.Router();
const upload = require('../lib/upload');

const restaurantController = require('../controllers/restaurant.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validatedMiddleware = require('../middlewares/validatedRestaurant.middleware');

//create and update restaurant operations 
router.post('/createRestaurant', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), validatedMiddleware.isValidated, upload.single("image"), restaurantController.createRestaurant);
router.put('/updateRestaurant/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), validatedMiddleware.isValidated, upload.single("image"), restaurantController.updateRestaurant);

// get restaurant informations by id
router.get('/restaurant/:id', restaurantController.getRestaurantById);

//get all restaurants (to display in the home page)
router.get('/allRestaurants', restaurantController.getAllRestaurants);

//get restaurant data for restaurant update dashboard
router.get('/updateRestaurantData', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), restaurantController.getUpdateRestaurantData);

//get restaurant average rating.
router.get('/reviewStats/:restaurantId', restaurantController.getRestaurantReviewStats);

module.exports = router;