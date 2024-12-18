const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Routes
router.get("/admin/categories", categoryController.getCategories);  // View all categories

// Render the form to create a new category
router.get("/admin/categories/create", (req, res) => {
  res.render("admin/category-form");//, { layout: "adminLayout" }if you want to have separate layut for this specific route
});

// Handle the form submission for creating a new category
router.post("/admin/categories/create", categoryController.createCategory);

// Render the form to edit an existing category
router.get("/admin/categories/edit/:id", categoryController.getEditCategory);  // Fetch category for editing

// Handle the form submission for updating a category
router.post("/admin/categories/edit/:id", categoryController.updateCategory);

// Route to delete a category
router.get("/admin/categories/delete/:id", categoryController.deleteCategory);

module.exports = router;
