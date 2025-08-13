const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3001;

app.get('/api/hello', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/getQuote', (req, res) => {
  const finnhub = require('finnhub');
  const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);

  const symbol = req.query.symbol;

  if (!symbol || symbol.trim() === '') {
    return res.status(400).send('Symbol parameter is required');
  }

  finnhubClient.quote(symbol, (error, data, response) => {
    if (error) {
      res.status(500).send('Error retrieving quote');
    } else {
      res.json(data);
      console.log(data);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});