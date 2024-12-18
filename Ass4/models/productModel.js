const mongoose = require("mongoose");
const { Schema, model } = mongoose;
  
  const ProductSchema = new Schema({
    title: {
      type: String,
      required: true,
      maxlength: 50
    },
    description: {
        type: String,
        required: true,
        maxlength: 50
     },
     price: {
      type: Number,
      required: true,
      min: 0, // or any minimum price
    },
    image: { 
      type: String 
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  });
  
  const ProductModel = model("Product", ProductSchema)
  
  module.exports = ProductModel