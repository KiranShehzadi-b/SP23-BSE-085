const Category = require("../models/categoryModel");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const allCategories = await Category.find();
    const currentRoute = req.originalUrl;
    res.render("admin/categories", {
      layout: "layout",
      pageTitle: "Manage Your Categories",
      categories: allCategories,
      currentRoute
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description, slug ,productCount} = req.body;
    const newCategory = new Category({ name, description, slug ,productCount});
    await newCategory.save();
    res.redirect("/admin/categories");
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Invalid Server Error" });
  }
};

// Update an existing category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug ,productCount} = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(id, { name, description, slug,productCount });
    res.redirect("/admin/categories");
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.redirect("/admin/categories");
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });
  }
};

// Get the category for editing
const getEditCategory = async (req, res) => {
  try {
    const { id } = req.params;  // Get the category ID from the URL parameter
    const category = await Category.findById(id);  // Find the category by ID

    if (!category) {
      return res.status(404).json({ message: "Category not found" });  // If the category doesn't exist
    }
    const currentRoute = req.originalUrl;
    // Render the category edit form and pass the category data to it
    res.render("admin/category-edit-form", {
      layout: "layout",  // Set the layout for the page
      category,  // Pass the category data to the form for editing
      currentRoute
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid Server Error" });  // Handle any server errors
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, getEditCategory };
