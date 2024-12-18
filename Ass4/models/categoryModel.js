const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the category (required)
  productCount: { type: Number, default: 0 }, // Number of products in the category (default 0)
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
