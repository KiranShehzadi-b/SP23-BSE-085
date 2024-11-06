const express = require('express');
const app = express();
const port = 3000;


app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/indexBootstrap.html');
});


app.get('/portfolio', (req, res) => {
  res.sendFile(__dirname + '/views/indexPortfolio.html');
});


app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
