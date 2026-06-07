const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the "Bearer <token>" string
            token = req.headers.authorization.split(' ')[1];

            // Cryptographically verify the token against your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user from the database (excluding their password) and attach to the request
            req.user = await User.findById(decoded.id).select('-password');
            next(); // Let the API route continue
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

module.exports = { protect };