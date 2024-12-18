const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Mongoose configuration
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    // No need for sslValidate option
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      ssl: true,  // Ensure SSL is used
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
