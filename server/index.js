//TODO implement tests
//TODO implement serivce of external api errors.
//TODO implement logger

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
  console.log(`Finnhub API Key: ${process.env.FINNHUB_API_KEY}`);

  const symbol = req.query.symbol?.trim();
  const stock = req.query.stock?.trim();

  if (!symbol || symbol.trim() === '') {
    return res.status(400).send('Symbol parameter is required');
  }
  if (!stock || stock.trim() === '') {
    return res.status(400).send('Stock parameter is required');
  }

  if (stock === "NYSE") {
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        res.status(500).send(`Error retrieving quote: ${error.message} for ${symbol} on ${stock}`);
      } else {
        res.json({"current": data?.c || null});
        console.log(`Fetching quote for ${symbol} on ${stock}`);
        console.log(data);
      }
    });
  } else {
    // Fetch real data for non-NYSE stocks using stooq API
    (async () => {
      try {
        const fetch = (await import('node-fetch')).default;
        // example url: https://stooq.pl/q/l/?s=kgh&f=sd2t2ohlcv&h&e=json
        const url = `https://stooq.pl/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=json`;
        const stooqRes = await fetch(url);
        const stooqData = await stooqRes.json();
        res.json({"current": stooqData?.symbols?.[0]?.close || null});
        console.log(`Fetching quote for ${symbol} on ${stock}`);
        console.log(stooqData);
      } catch (err) {
        res.status(500).send('Error retrieving quote from stooq');
      }
    })();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});