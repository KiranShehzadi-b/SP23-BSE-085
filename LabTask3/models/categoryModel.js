const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  slug: { type: String,  unique: true },
productCount: { type: Number, default: 0 },
image: { 
  type: String 
},

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
