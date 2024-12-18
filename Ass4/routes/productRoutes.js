const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const Category = require('../models/categoryModel');
const dotenv = require("dotenv");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed file types
  },
});

const uploads = multer({ storage: storage });


// Routes
router.get("/admin/products", productController.getProduct);

router.get("/admin/products/create", async (req, res) => {
  const currentRoute = req.originalUrl;
  const categories = await Category.find();
  res.render('admin/product-form', { categories ,currentRoute });
});

router.post("/admin/products/create", uploads.single('file'), productController.createProduct);

router.get("/admin/products/edit/:id", productController.getEditProduct); // Fetch product for editing

// Route to handle the form submission for editing the product
router.post("/admin/products/edit/:id",uploads.single('file'), productController.updateProduct);

router.get("/admin/products/delete/:id", productController.deleteProduct);

module.exports = router;
