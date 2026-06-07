const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // We will put the actual URL in a .env file later
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;