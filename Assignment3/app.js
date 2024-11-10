const express = require('express');
const app = express();


app.use(express.static('public'));


app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.render('indexBootstrap');
});


app.get('/portfolio', (req, res) => {
  res.render('indexPortfolio');
});


app.listen(3000, () => {
  console.log(`App listening at http://localhost:3000`);
});
