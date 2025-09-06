// NOTE  iwr "https://sincere-stillness-production.up.railway.app/api/getQuote?symbol=AAPL&stock=NYSE"

const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');
const client = require('prom-client');
const register = new client.Registry();

dotenv.config();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  // w.o format winston prints jsons, less readable
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

const app = express();
const port = process.env.PORT || 3001;

// Histogram for request durations
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Counter for total requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Counter for errors
const httpRequestErrorCounter = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestErrorCounter);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Middleware to record metrics for every request
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .observe(duration);
    httpRequestCounter
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .inc();
    if (res.statusCode >= 400) {
      httpRequestErrorCounter
        .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
        .inc();
    }
  });
  next();
});

app.get('/api/hello', (req, res) => {
  logger.info('GET /api/hello called');
  res.send('Hello World!');
});

// app.get("/api/env", (req, res) => {
//   res.json(process.env);
// });

app.get('/api/getQuote', (req, res) => {
  
  
  const symbol = req.query.symbol?.trim().toUpperCase();
  const stock = req.query.stock?.trim().toUpperCase();
  

  if (!symbol || symbol.trim() === '' || !stock || stock.trim() === '') {
    logger.warn(`Missing parameter: symbol=${symbol}, stock=${stock}`);
    return res.status(400).send('Symbol or stock parameter missing');
  }

  if (stock === "NYSE") {
    const finnhub = require('finnhub');
    const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);
    //logger.info(`Fetching quote for ${symbol} on ${stock}`);
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        const errorMessage = `Error retrieving quote: ${error.message} for ${symbol} on ${stock}`;
        logger.error(errorMessage);
        res.status(500).send(errorMessage);
      } else {
        if (data?.c == 0) {
            logger.warn(`Invalid symbol: ${symbol} on ${stock} (returned zero value). Data received: ${JSON.stringify(data)}`);
          return res.status(404).json({ error: 'Stock symbol not found or invalid' });
        }
        logger.info(`Quote data for ${symbol} on ${stock}: ${JSON.stringify(data)}`);
        res.json({"current": data?.c || null});
      }
    });
  } else {
    // Fetch real data for non-NYSE stocks using stooq API
    (async () => {
      try {
        //logger.info(`Fetching quote for ${symbol} on ${stock}`);
        const fetch = require('node-fetch'); // see comments at the bottom of the file
        // example url: https://stooq.pl/q/l/?s=kgh&f=sd2t2ohlcv&h&e=json
        const url = `https://stooq.pl/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=json`;
        const stooqRes = await fetch(url);
        const stooqData = await stooqRes.json();
        // {"symbols":[{"symbol":"unexisting_symbol"}]}
        if (!stooqData?.symbols?.[0]?.close) {
          const errorMessage = `Invalid symbol or no data: ${symbol} on ${stock}`;
          logger.warn(errorMessage);
          return res.status(404).json({ error: 'Stock symbol not found or invalid' });
        }
        logger.info(`Stooq data for ${symbol} on ${stock}: ${JSON.stringify(stooqData)}`);
        res.json({"current": stooqData?.symbols?.[0]?.close || null});
      } catch (err) {
        logger.error(`Error retrieving quote from stooq: ${err.message}`);
        res.status(500).send(`Error retrieving quote`);
      }
    })();
  }
});

app.listen(port, () => {
  logger.info(`Server listening at port ${port}`);
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