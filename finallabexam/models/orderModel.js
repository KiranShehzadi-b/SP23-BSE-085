const mongoose = require("mongoose");

let orderSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Reference to the user placing the order
  items: [
    {
      title: { type: String, required: true }, // Title of the product
      quantity: { type: Number, required: true } // Quantity of the product
    }
  ],
  totalAmount: { type: String, required: true }, // Total price of the order
  city: { type: String, required: true }, // User's city for the order
  country: { type: String, required: true }, // User's country for the order
  street: { type: String, required: true }, // Street address
  postalCode: { type: String, required: true }, // Postal code
  paymentMethod: { 
    type: String, 
    required: true, 
    default: "Cash" 
  }, // Payment method, default is "Cash"
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Completed", "Cancelled"], 
    default: "Pending" 
  }, // Order status with default as "Pending"
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Order creation date (current timestamp)
  orderDateTime: { 
    type: Date, 
    default: Date.now 
  }, // Order date and time (current timestamp)
});

let OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
