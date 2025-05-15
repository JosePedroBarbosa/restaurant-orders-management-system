const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
let authMiddleware = require('../middlewares/auth.middleware');

router.get('/getCart', authMiddleware.protectRoute, cartController.getPersonalCard);

router.post('/addItem', authMiddleware.protectRoute, cartController.addItemToCart);
router.delete("/removeItem/:menuItemId/:portionName", authMiddleware.protectRoute, cartController.removeItemFromCart);

router.put("/updateItemQuantity/:menuItemId/:portionName", authMiddleware.protectRoute, cartController.updateItemQuantity);

router.delete("/clearCart", authMiddleware.protectRoute, cartController.clearCart);

router.post("/submitOrder", authMiddleware.protectRoute, cartController.submitOrder);

module.exports = router;