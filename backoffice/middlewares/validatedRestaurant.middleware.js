const User = require("../models/user");

let validatedRestaurantMiddleware = {};

validatedRestaurantMiddleware.isValidated = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if(!user.isValidated){
      return res.status(403).json({ message: "You are not a validated restaurant." });
    }

    next();
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = validatedRestaurantMiddleware;