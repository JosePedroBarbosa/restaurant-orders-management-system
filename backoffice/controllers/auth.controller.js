let User = require("../models/user");
let bcrypt = require("bcrypt");

let generateToken = require('../lib/utils');

let authController = {};

authController.signup = async (req, res) => {
    try {
        const { userName, password, confirmPassword, fullName, street, city, postalCode, role } = req.body;

        const address = {
            street, city, postalCode
        };

        if (!userName || !password || !confirmPassword || !fullName || !role || !street || !city || !postalCode) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match!" });
        }

        if (userName.length < 6) {
            return res.status(400).json({ message: "Username must be at least 6 characters long" });
        }

        if (role && !["customer", "restaurant"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserData = {
            userName,
            password: hashedPassword,
            fullName,
            address,
            role,
            cancelHistory: [], 
            blockedUntil: null  
        };

        const newUser = new User(newUserData);
        await newUser.save();

        const token = generateToken(newUser._id, newUser.role, res);

        return res.status(201).json({
            message: 'User registered successfully',
            token: token,
            user: {
                _id: newUser._id,
                userName: newUser.userName,
                fullName: newUser.fullName,
                address: newUser.address,
                role: newUser.role,
                isValidated: newUser.isValidated
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


authController.login = async (req, res) => {
    try{
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verificar palavra-passe
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role, res);

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                _id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                role: user.role,
                isValidated: user.isValidated
            }
        });
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

authController.profileInformations = function(req, res) {
    return res.status(201).json({
        message: 'User profile information',
        user: {
            _id: req.user._id,
            userName: req.user.userName,
            fullName: req.user.fullName,
            address: req.user.address,
            role: req.user.role,
            isValidated: req.user.isValidated
        }
    });
};

module.exports = authController;