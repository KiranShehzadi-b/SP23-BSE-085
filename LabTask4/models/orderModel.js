const mongoose = require("mongoose");

let orderSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Reference to the user placing the order
  
  totalAmount: { type: String, required: true }, // Total price of the order
  city: { type: String, required: true }, // User's city for the order
  country: { type: String, required: true },
  address: { type: String, required: true }, // User's country for the order
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Completed", "Cancelled"], 
    default: "Pending" 
  }, 
  paymentMethod:{type:String},// Order status with default as "Pending"
  createdAt: { type: Date, default: Date.now }, // Order creation date
});

let OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
