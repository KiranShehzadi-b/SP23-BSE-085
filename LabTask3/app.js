const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.set("layout", "adminlayout");


app.use(express.static(path.join(__dirname, "public")));


let adminProductsRouter = require("./routes/admin/products.controller");
app.use(adminProductsRouter);



app.get('/', (req, res) => {
  res.render('indexBootstrap');
});
app.get('/about-me', (req, res) => {
  return res.render('about-me');
});
app.get('/homepage', (req, res) => {
  return res.render('homepage');
});


app.get('/portfolio', (req, res) => {
  res.render('indexPortfolio');
});


app.listen(4002, () => {
  console.log(`App listening at http://localhost:4002`);
});



