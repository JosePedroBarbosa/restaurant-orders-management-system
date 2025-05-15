let jwt = require('jsonwebtoken');
let User = require("../models/user");

let authMiddleware = {};

authMiddleware.protectRoute = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if(!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password'); // Exclude password from user object

        if (!req.user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        next();
    }catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = authMiddleware;