const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");


const connectDB = require("./config/db");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const Product = require("./models/productModel");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine and static file settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Layout settings
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout");

// Cloudinary configuration
// Export the upload configuration


// Routes
app.get("/", async (req, res) => {
  let products = await Product.find();
  return res.render("homepage", { style: 'mystyle.css' , products });
});


app.use(productRouter);
app.use(categoryRouter);
app.get('/admin/dashboard', (req, res) => {
  res.render('dashboard', {layout:"adminLayout"});
});

// Centralized error handling


// Server setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Products Managing app listening on port ${port}`);
});
