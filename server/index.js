//TODO implement tests
//TODO implement serivce of external api errors.
//TODO implement logger
// NOTE  iwr "https://sincere-stillness-production.up.railway.app/api/getQuote?symbol=AAPL&stock=NYSE"

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/hello', (req, res) => {
  res.send('Hello World!');
});

// app.get("/api/env", (req, res) => {
//   res.json(process.env);
// });

app.get('/api/getQuote', (req, res) => {
  
  
  const symbol = req.query.symbol?.trim().toUpperCase();
  const stock = req.query.stock?.trim().toUpperCase();
  
  if (!symbol || symbol.trim() === '') {
    return res.status(400).send('Symbol parameter is required');
  }
  if (!stock || stock.trim() === '') {
    return res.status(400).send('Stock parameter is required');
  }
  
  if (stock === "NYSE") {
    const finnhub = require('finnhub');
    const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);
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
        console.log(`Fetching quote for ${symbol} on ${stock}`);
        const fetch = require('node-fetch'); // see comments at the bottom of the file
        // example url: https://stooq.pl/q/l/?s=kgh&f=sd2t2ohlcv&h&e=json
        const url = `https://stooq.pl/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=json`;
        const stooqRes = await fetch(url);
        const stooqData = await stooqRes.json();
        console.log("data: ", stooqData);
        res.json({"current": stooqData?.symbols?.[0]?.close || null});
        console.log(stooqData);
      } catch (err) {
        console.error(`Error retrieving quote from stooq: ${err.message}`);
        res.status(500).send(`Error retrieving quote from stooq: ${err.message}`);
      }
    })();
  }
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

module.exports = app;



/*
to use 
  const fetch = require('node-fetch'); 

I had to downgrade node-fetch module.

npm uninstall node-fetch
npm install node-fetch@2

When I used "dynamic exports"  an error was raised 
A dynamic import callback was invoked without --experimental-vm-modules 
The solution for it is use --experimental-vm-modules flag . I didn't tested it. 
*/