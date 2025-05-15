const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../lib/upload');

//Menu crud operations
router.post('/createMenu', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), upload.single("image"), menuController.createMenu);
router.put('/updateMenu/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), upload.single("image"), menuController.updateMenu);
router.delete('/deleteMenu/:id', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuController.deleteMenu);

// Add and remove menu items from a specific menu id
router.post('/:menuId/addItem/', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuController.addMenuItem);
router.delete('/:menuId/removeItem/:itemId', authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant', 'admin']), menuController.removeMenuItem);

// Get my menus and menu by id
router.get('/myMenus',  authMiddleware.protectRoute, roleMiddleware.authorizeRole(['restaurant']), menuController.getMyMenus);
router.get('/menu/:id', menuController.getMenuById);

//pesquisa e filtros
router.get('/searchMenuItems', menuController.searchMenuItems);
router.get('/filters', menuController.getFilters);

module.exports = router;