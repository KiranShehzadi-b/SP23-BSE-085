const mongoose = require("mongoose");

// Define the User schema
let usersSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" }, // Default role as 'customer'
  city: { type: String }, // City of the user
  country: { type: String }, // Country of the user
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }] // Reference to orders
});

// Create the User model
let UserModel = mongoose.model("User", usersSchema);

module.exports = UserModel;
