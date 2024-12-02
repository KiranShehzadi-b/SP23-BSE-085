const express = require('express');
const expressLayouts = require('express-ejs-layouts'); 
const app = express();


app.use(express.static('public'));

app.set('view engine', 'ejs');


app.use(expressLayouts);


app.set('layout', 'layout'); 


app.get('/', (req, res) => {
  res.render('indexBootstrap');
});


app.listen(3000, () => {
  console.log(`App listening at http://localhost:3000`);
});
