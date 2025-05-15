let roleMiddleware = {};

roleMiddleware.authorizeRole = (roles) => {
    return async (req, res, next) => {
       try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized - User not authenticated.' });
            }
            
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden - Insufficient permissions.' });
            }

            next();
       }catch(error){
            console.error("Role Middleware Error:", error);
            res.status(500).json({ message: 'Internal Server Error' });
       }
    }
}

module.exports = roleMiddleware;