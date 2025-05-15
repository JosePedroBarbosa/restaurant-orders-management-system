let express = require('express');
let router = express.Router();

let authController = require('../controllers/auth.controller');
let authMiddleware = require('../middlewares/auth.middleware');

// Sign up a new user
router.post('/signup', function(req, res) {
    authController.signup(req, res);
});

// Log in an existing user
router.post('/login', function(req, res) {
    authController.login(req, res);
});

// get user informations to display in the profile page
router.get('/profileInfo', authMiddleware.protectRoute, function(req, res) {
    authController.profileInformations(req, res);
}); 

module.exports = router;