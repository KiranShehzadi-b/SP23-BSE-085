const Product = require("../models/productModel");
const Category = require('../models/categoryModel');

const getProduct = async (req, res) => {
  try {
    // Fetch all products and populate the category details
    const allProducts = await Product.find().populate("category");

    // Render the products page with the products data
    res.render("admin/products", {
      layout: "layout",
      pageTitle: "Manage Your Products",
      products: allProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error); // Log the error for debugging
    res.status(500).json({ message: "Server Error: Unable to fetch products." });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const file = req.file; // Access the uploaded file

    if (!title || !description || !price || !category) {
      return res.status(400).send("All fields are required.");
    }

    const imageUrl = file ? file.path : null;

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      image: imageUrl,
    });

    await newProduct.save();

    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Error creating product" });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, { title, description, price });
    res.redirect("/admin/products");
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/admin/products");
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });
  }
};
const getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;  // Get the product ID from the URL parameter
    const product = await Product.findById(id);  // Find the product by ID

    if (!product) {
      return res.status(404).json({ message: "Product not found" });  // If the product doesn't exist
    }
    const categories = await Category.find();
    // Render the product edit form and pass the product data to it
    res.render("admin/product-edit-form", {
      layout: "adminlayout",  // Set the layout for the page
      product,  // Pass the product data to the form for editing
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });  // Handle any server errors
  }
};

module.exports = { getProduct, createProduct, updateProduct, deleteProduct,getEditProduct };
