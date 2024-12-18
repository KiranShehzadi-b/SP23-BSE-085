const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const OrderModel = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/user.model");


router.use(cookieParser());
router.use(
  session({
    secret: "SecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
router.use(flash());
router.use((req, res, next) => {
  res.locals.messages = req.flash("messages");
  next();
});

// Cart page route
router.get("/cart", async (req, res) => {
  let cart = req.cookies.cart;
  cart = cart ? cart : [];

  let productIds = cart.map((item) => item.id); // Extract product IDs from the cart
  let products = await Product.find({ _id: { $in: productIds } });

  // Calculate total amount of the products in the cart
  let totalAmount = 0;
  products = products.map((product) => {
    let cartItem = cart.find(
      (item) => item.id.toString() === product._id.toString()
    );
    let quantity = cartItem ? cartItem.quantity : 1; // Default quantity if not specified
    let amount = product.price * quantity;
    totalAmount += amount;

    return {
      ...product.toObject(),
      quantity,
      amount,
    };
  });

  // Pass both products, totalAmount, and a custom body content to the layout
  res.render("cart", {
    products,
    totalAmount,
    layout: "cartLayout", // Custom layout
    messages: req.flash("messages"), // Flash messages
  });
});

// Update cart quantity route
router.post("/update-quantity/:id", (req, res) => {
  let cart = req.cookies.cart;
  cart = cart ? cart : [];

  // Find the product in the cart
  let productIndex = cart.findIndex(
    (item) => item.id.toString() === req.params.id
  );

  if (productIndex !== -1) {
    // Check if req.body.quantity is a string or number
    let quantityFromBody = req.body.quantity;
    let newQuantity =
      typeof quantityFromBody === "string"
        ? parseInt(quantityFromBody, 10)
        : quantityFromBody; // If it's already a number, use it directly

    // If it's a valid number and greater than 0, update the quantity
    cart[productIndex].quantity = newQuantity > 0 ? newQuantity : 1;
  }

  // Save the updated cart in the cookie
  res.cookie("cart", cart);

  // Redirect back to the cart page with a flash message
  req.flash("messages", "Cart updated successfully!");
  return res.redirect("/cart");
});

// Add to cart route
router.get("/add-to-cart/:id", async (req, res) => {
  let cart = req.cookies.cart || []; // Default to empty array if cart is not set

  // Check if the product is already in the cart
  let productIndex = cart.findIndex(
    (item) => item.id.toString() === req.params.id
  );

  if (productIndex !== -1) {
    // If the product is already in the cart, increase the quantity
    cart[productIndex].quantity = Number(cart[productIndex].quantity) + 1;
  } else {
    // If the product is not in the cart, add it with a quantity of 1
    cart.push({
      id: req.params.id, // Store only the ID and quantity
      quantity: 1,
    });
  }

  // Save the updated cart in the cookie
  res.cookie("cart", cart);

  // Flash success message
  req.flash("messages", "Product added to your cart!");

  // Redirect back to the home page
  return res.redirect("/homePage");
});

router.post("/remove-product/:productId", (req, res) => {
  const productId = req.params.productId;
  let cart = req.cookies.cart || []; // Use cookies to access the cart (or use session if preferred)

  // Check if the product exists in the cart
  const productIndex = cart.findIndex(
    (item) => item.id.toString() === productId
  );

  if (productIndex !== -1) {
    // Remove the product from the cart
    cart.splice(productIndex, 1);
  }

  res.cookie("cart", cart);

  // Redirect back to the cart page with a flash message
  req.flash("messages", "Product removed from the cart!");
  res.redirect("/cart");
});

// Admin orders route (no search logic)
router.get("/admin/orders", async (req, res) => {
  try {
    // Fetch orders sorted by totalAmount in descending order
    const orders = await OrderModel.find()
      .populate("user") // Populating the user field with the corresponding User document
      .sort({ totalAmount: -1 }); // Sorting by totalAmount in descending order

    const currentRoute = req.originalUrl;
    // Render the orders page with the orders
    res.render("admin/orders", {
      layout: "layout",
      pageTitle: "Manage Your Orders",
      orders,
      currentRoute,
      messages: req.flash("messages"), // Pass flash messages to the view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching orders");
  }
});

// Route to render the order creation form
router.get("/orders/place", async (req, res) => {
  try {
    // Default to an empty array if cart is undefined
    const currentRoute = req.originalUrl;
    // Further logic for order placement goes here...

    // Render order creation page
    res.render("admin/order", {
      layout: "layout",
      pageTitle: "Manage Your Orders",
      currentRoute,
      messages: req.flash("messages")
    });
    

  } catch (error) {
    console.error(error);
    req.flash("messages", "Error placing order.");
    res.redirect("/cart"); // Redirect in case of an error
  }
});


// Place order route
router.post("/orders/place", async (req, res) => {
  const { name, street, postalCode, city, country } = req.body;

  try {
    // Validate input fields
    if (!name || !street || !postalCode || !city) {
      req.flash("messages", "All fields are required.");
      return res.redirect("/orders/place");
    }

    // Retrieve the cart from cookies
    let cart = req.cookies.cart || [];

    if (!cart || cart.length === 0) {
      req.flash("messages", "Cart is empty or invalid.");
      return res.redirect("/orders/place");
    }

    // Extract product titles, quantities, and calculate total amount
    const productIds = cart.map((item) => item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    const items = [];
    let totalAmount = 0;

    products.forEach((product) => {
      const cartItem = cart.find(
        (item) => item.id.toString() === product._id.toString()
      );
      const quantity = cartItem ? cartItem.quantity : 1; // Default quantity is 1
      items.push({
        title: product.title, // Add product title
        quantity: quantity,
      });
      totalAmount += product.price * quantity;
    });

    // Get the user by their name (or fetch user from the session if logged in)
    const user = await User.findOne({ name: name });  // Assuming the user's name is unique. Otherwise, use a session-based approach.
    if (!user) {
      req.flash("messages", "User not found.");
      return res.redirect("/orders/place");
    }

    // Create and save the order with the correct user ObjectId
    const newOrder = new OrderModel({
      user: user._id, // Pass the user ObjectId here
      items: items, // Include product titles and quantities
      totalAmount: totalAmount, // Use server-validated amount
      street,
      postalCode,
      city,
      country: "Pakistan",
      paymentMethod: "Cash", // Default to "Cash"
      status: "Pending",
      createdAt: Date.now(), // Set creation date
      orderDateTime: Date.now(), // Set order date and time
    });

    await newOrder.save();

    // Clear the cart after placing the order
    res.clearCookie("cart");
    req.flash("messages", "Order has been placed successfully.");

    // Redirect to the homepage or orders page
    return res.redirect("/homePage");
  } catch (error) {
    console.error("Error placing order:", error);
    req.flash("messages", "An error occurred while placing the order. Please try again.");
    return res.status(500).redirect("/orders/place");
  }
});
// Admin edit order route
router.get("/admin/orders/edit/:id", async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id).populate("user");

    const currentRoute = req.originalUrl;
    res.render("admin/order-edit", {
      layout: "layout",
      order,
      currentRoute,
      // Include flash messages here
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching order for editing");
  }
});

router.post("/admin/orders/edit/:id", async (req, res) => {
  const { status } = req.body;
  try {
    // Find the order by ID and update its status
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    req.flash("message", "Order edited successfully"); // Set flash message
    // Redirect to the orders page after updating
    res.redirect("/admin/orders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating order");
  }
});

// Admin delete order route
router.get("/admin/orders/delete/:id", async (req, res) => {
  try {
    // Extract the order ID from the URL parameters
    await OrderModel.findByIdAndDelete(req.params.id);
    req.flash("message", "Order deleted successfully");
    // Redirect to the orders page after deletion
    res.redirect("/admin/orders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting order");
  }
});
//Add an API endpoint to handle the creation of an order when the checkout form is submitted.
router.get("/api/admin/orders", async (req, res) => {
  try {
    // Fetch orders sorted by totalAmount in descending order
    const orders = await OrderModel.find()
      .populate("user") // Populating the user field with the corresponding User document
      .sort({ totalAmount: -1 }); // Sorting by totalAmount in descending order

    // Return the orders as a JSON response
    res.json({
      success: true,
      message: "Orders fetched successfully",
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});
//Add another API endpoint to retrieve all orders for the admin panel.
router.post("/api/orders/place", async (req, res) => {
  const { name, street, postalCode, city, country } = req.body;

  try {
    // Validate input fields
    if (!name || !street || !postalCode || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    
    const cart = req.body.cart || [];  // You can pass the cart as part of the request body

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid."
      });
    }

    // Extract product titles, quantities, and calculate total amount
    const productIds = cart.map((item) => item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    const items = [];
    let totalAmount = 0;

    products.forEach((product) => {
      const cartItem = cart.find(
        (item) => item.id.toString() === product._id.toString()
      );
      const quantity = cartItem ? cartItem.quantity : 1; // Default quantity is 1
      items.push({
        title: product.title, // Add product title
        quantity: quantity,
      });
      totalAmount += product.price * quantity;
    });

    // Get the user by their name (assuming the user's name is unique)
    const user = await User.findOne({ name: name });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    
    const newOrder = new OrderModel({
      user: user._id, // Pass the user ObjectId here
      items: items, // Include product titles and quantities
      totalAmount: totalAmount, // Use server-validated amount
      street,
      postalCode,
      city,
      country,
      paymentMethod: "Cash", // Default to "Cash"
      status: "Pending",
      createdAt: Date.now(), // Set creation date
      orderDateTime: Date.now(), // Set order date and time
    });

    await newOrder.save();

   
    return res.status(201).json({
      success: true,
      message: "Order has been placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while placing the order. Please try again."
    });
  }
});


module.exports = router;