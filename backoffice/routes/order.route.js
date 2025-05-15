const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
let authMiddleware = require('../middlewares/auth.middleware');
let roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../lib/upload');

router.get('/order/:id', authMiddleware.protectRoute, orderController.getOrderById);
router.get('/orders/:restaurantId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant']), orderController.getRestaurantOrders);
router.get('/history/:userId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant']), orderController.getRestaurantOrdersHistory);
router.put('/updateStatus/:orderId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'customer']), orderController.updateOrderStatus);
router.get('/history', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['customer']), orderController.getUserOrderHistory);
router.post('/review/:orderId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['customer']), upload.single("photo"), orderController.reviewOrderById);

module.exports = router;