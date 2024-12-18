const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs"); 
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const connectDB = require('./config/db');
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const Product = require("./models/productModel");
const Category = require("./models/categoryModel");
const User = require("./models/user.model");
const orderRoutes = require("./controllers/order.controller");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine and static file settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Layout settings
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
const siteMiddleware = require("./middlewares/site-middleware");
const authMiddleware = require("./middlewares/auth-middleware");
const adminMiddleware = require("./middlewares/admin-middleware");
app.use(cookieParser());
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash());
app.use(siteMiddleware);

// Authentication Routes

// Login Page
app.get("/login", async (req, res) => {
  const messages = req.flash("messages");
  res.render("authentication/loginForm", {
    layout: "loginFormLayout",
    style: "/css/style.css",
    messages // Pass flash messages to the view
  });
});

// Login Handler
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:", email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("messages", "Invalid username or password. Please try again.");
      return res.redirect("/login");
    }

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("messages", "Invalid password. Please try again.");
      return res.redirect("/login");
    }

    req.session.user = { id: user._id, role: user.role };
    req.flash("messages", "Logged In successfully.");
    console.log("User logged in:", user);

    return user.role === "admin"
      ? res.redirect("/admin/dashboard")
      : res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("messages", "An error occurred. Please try again.");
    return res.redirect("/login");
  }
});

// Registration Page
app.get("/register", async (req, res) => {
  const messages = req.flash("messages");
  res.render("authentication/registerForm", {
    layout: "loginFormLayout",
    style: "/css/style.css",
    messages
  });
});

// Registration Handler
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!password || password.trim() === "") {
    req.flash("messages", "Password cannot be empty.");
    return res.redirect("/register");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("messages", "This email is already registered. Please try another one.");
      return res.redirect("/register");
    }

    // Hash and salt the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.flash("messages", "Account created successfully! Please log in.");
    return res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("messages", "An error occurred. Please try again.");
    return res.redirect("/register");
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("messages", "You have been logged out.");
  res.redirect("/login");
});

// Admin Dashboard Route
app.get("/admin/dashboard", adminMiddleware, (req, res) => {
  res.render("dashboard", { layout: "adminLayout", messages: req.flash("messages") });
});

// Home Page
app.get("/", async (req, res) => {
  return res.render("indexBootstrap", { layout: "layoutWebsite", messages: req.flash("messages") });
});



app.get("/homePage", async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1; // Get current page from query parameter, default to 1
    const itemsPerPage = parseInt(req.query.limit) || 3; // Default to 3 items per page
    const searchQuery = req.query.search || ""; // Get search query from the URL, default to empty string
    // Sort input (if any)

    const skipItems = (currentPage - 1) * itemsPerPage;

    // Fetch all categories for dropdown
    const currentRoute = "/homePage";

    // Build the search filter
    const searchFilter = {};

    // Search for product name or category name
    if (searchQuery) {
      searchFilter.$or = searchFilter.$or || [];

      searchFilter.$or.push({ title: { $regex: searchQuery, $options: "i" } });

      // Search for matching categories
      const matchedCategories = await Category.find({ name: { $regex: searchQuery, $options: "i" } });
      const categoryIds = matchedCategories.map(cat => cat._id);

      searchFilter.$or.push({ category: { $in: categoryIds } });
    }
    // Fetch products based on search filter
    let products = await Product.find(searchFilter)
      .populate("category")
      .skip(skipItems)
      .limit(itemsPerPage);
    // Count total products matching the search filter
    const totalProducts = await Product.countDocuments(searchFilter);
    const totalPageCount = Math.ceil(totalProducts / itemsPerPage);
   
    // Render the homepage with products, pagination details, search query, and categories
    res.render("homepage", {
      layout: "layout", // Use your custom layout here
      products,
      messages: req.flash("messages"), // Pass flash messages to the view
      currentPage,
      totalPageCount,
      searchQuery, // Pass search query to the view
      currentRoute
     
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal server error");
  }
});
app.use(orderRoutes);
app.use(productRouter);
app.use(categoryRouter);

// Centralized error handling
// 

// Server setup
const PORT = process.env.PORT || 12000;
app.listen(PORT, () => {
  console.log(`Products Managing app listening on port ${PORT}`);
});
