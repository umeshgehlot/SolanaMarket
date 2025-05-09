"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
// Mock connection function for development without MongoDB
const connectDB = async () => {
    try {
        // For development purposes, we'll use mock data instead of a real MongoDB connection
        // This allows the application to run without a MongoDB instance
        // Log success message for development
        logger_1.logger.info('Development mode: Using mock data instead of MongoDB');
        // In a real implementation, you would connect to MongoDB like this:
        // const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nft-marketplace';
        // await mongoose.connect(mongoURI);
        // logger.info('MongoDB connected successfully');
        // For now, we'll just return without connecting to avoid the error
        return;
    }
    catch (error) {
        logger_1.logger.error('Error in database setup:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
