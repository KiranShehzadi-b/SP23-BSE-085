const express = require("express");
const router = express.Router();


let products = [
  {
    title: "IPhone",
    price: "One Kidney",
    description: "Sweet Dreams",
    _id: 1,
  },
  {
    title: "Nokia",
    price: "Half Kidney",
    description: "Sweet Dreams/2",
    _id: 2,
  },
];


router.get("/admin/product/create", (req, res) => {
  return res.render("admin/createProduct", { layout: "adminlayout" });
});



router.get("/admin/product", (req, res) => {
  return res.render("admin/product", {
    layout: "adminlayout",
    pageTitle: "Manage Your Products",
    products,
  });
});


router.post("/admin/product", (req, res) => {
  const { id, title, description, price } = req.body;


  products.push({ _id: id, title, description, price });


  res.redirect("/admin/product");
});

module.exports = router;
