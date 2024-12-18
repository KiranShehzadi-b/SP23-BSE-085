const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Category = require('../models/categoryModel');
app.use(
  session({
    secret: "SecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash("messages");
  next();
});

const getProduct = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 4;

    const searchQuery = req.query.search || "";
    const filterBy = req.query.filterBy || ""; // Filter input
    const sortBy = req.query.sortBy || ""; // Sort input
    const currentRoute = '/admin/products';

    const skipItems = (currentPage - 1) * itemsPerPage;

    // Fetch all categories for dropdown
    const categories = await Category.find({});

    // Build the search filter
    const searchFilter = {};

    // Search for title or category name
    if (searchQuery) {
      searchFilter.$or = searchFilter.$or || [];

      searchFilter.$or.push({ title: { $regex: searchQuery, $options: "i" } });

      // Search for matching categories
      const matchedCategories = await Category.find({ name: { $regex: searchQuery, $options: "i" } });
      const categoryIds = matchedCategories.map(cat => cat._id);

      searchFilter.$or.push({ category: { $in: categoryIds } });
    }

    // Fetch products based on search filter
    const searchedProducts = await Product.find(searchFilter).populate("category");
    const totalSearchedProducts = searchedProducts.length;
    const totalPagesForSearchedProducts = Math.ceil(totalSearchedProducts / itemsPerPage);
    const paginatedSearchedProducts = searchedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // Add category filter from dropdown
    let filteredProducts = [];
    if (filterBy && mongoose.isValidObjectId(filterBy)) {
      
      filteredProducts = await Product.find({ category: filterBy }).populate("category");
    }
    const totalFilteredProducts = filteredProducts.length;
    const totalPagesForFilteredProducts = Math.ceil(totalFilteredProducts / itemsPerPage);
    const paginatedFilteredProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // Sorting logic
    let sortedProducts = await Product.find().populate("category");

    if (sortBy === "asc") {
      
      sortedProducts = sortedProducts.sort((a, b) => a.price - b.price); // Sort by price ascending
    } else if (sortBy === "desc") {
      
      sortedProducts = sortedProducts.sort((a, b) => b.price - a.price); // Sort by price descending
    }

    // Apply pagination to sorted products
    const totalSortedProducts = sortedProducts.length;
    const totalPagesForSortedProducts = Math.ceil(totalSortedProducts / itemsPerPage);
    const paginatedSortedProducts = sortedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // Render the view with pagination, search query, filter, and sort info
    if (searchQuery) {
      return res.render("admin/products", {
        layout: "layout",
        pageTitle: "Manage Your Products",
        products: paginatedSearchedProducts,
        currentPage,
        totalPageCount: totalPagesForSearchedProducts,
        searchQuery,
        categories,
        currentRoute
      });
    } else if (filterBy) {
      return res.render("admin/products", {
        layout: "layout",
        pageTitle: "Manage Your Products",
        products: paginatedFilteredProducts,
        currentPage,
        totalPageCount: totalPagesForFilteredProducts,
        searchQuery: "", // Clear search query on filter
        categories,
        filterBy,
        currentRoute
      });
    } else if (sortBy) {
      return res.render("admin/products", {
        layout: "layout",
        pageTitle: "Manage Your Products",
        products: paginatedSortedProducts,
        currentPage,
        totalPageCount: totalPagesForSortedProducts,
        searchQuery: "", // Clear search query on sort
        categories,
        sortBy,
        currentRoute
      });
    } else {
      // Default render when no search, filter, or sort is applied
      return res.render("admin/products", {
        layout: "layout",
        pageTitle: "Manage Your Products",
        products: paginatedSortedProducts,
        currentPage,
        totalPageCount: totalPagesForSortedProducts,
        searchQuery: "", // Clear search query when not searching
        categories,
        currentRoute
      });
    }
  } catch (error) {
    console.error("Error fetching filtered and sorted products:", error);
    req.flash('messages', 'Error fetching products.');
    res.status(500).json({ message: "Server Error: Unable to fetch products." });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const file = req.file; // Access the uploaded file

    if (!title || !description || !price || !category) {
      req.flash('messages', 'All fields are required.');
      return res.redirect("/admin/products");
    }
     // This will dynamically set the current route based on the request's URL.

    const imageUrl = file ? file.path : null;

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      image: imageUrl,
    });

    await newProduct.save();
    req.flash('messages', 'Product created successfully!');
    res.redirect("/admin/products");
  } catch (error) {
    req.flash('messages', 'Error creating product.');
    res.redirect("/admin/products");
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;
    
    // Check if the file is uploaded
    const file = req.file;
    let imageUrl = null;

    if (file) {
      imageUrl = file.path;
    } else {
      const product = await Product.findById(id);
      imageUrl = product.image; // Keep the current image URL if no new file is uploaded
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, { title, description, price, category, image: imageUrl }, { new: true });

    req.flash('messages', 'Product updated successfully!');
    res.redirect("/admin/products");
  } catch (error) {
    req.flash('messages', 'Error updating product.');
    res.redirect("/admin/products");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('messages', 'Product deleted successfully!');
    res.redirect("/admin/products");
  } catch (error) {
    req.flash('messages', 'Error deleting product.');
    res.redirect("/admin/products");
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
    const currentRoute = req.originalUrl;
    // Render the product edit form and pass the product data to it
    res.render("admin/product-edit-form", {
      layout: "layout",  // Set the layout for the page
      product,  // Pass the product data to the form for editing
      categories,
      currentRoute
    });
  } catch (error) {
    req.flash('messages', 'Error fetching product details.');
    res.status(500).json({ message: "Invalid Server Error" });  // Handle any server errors
  }
};

module.exports = { getProduct, createProduct, updateProduct, deleteProduct, getEditProduct };
