const request = require('supertest');
const nock = require('nock');
const app = require('../index'); // Adjust if your Express app is exported

describe('GET /api/getQuote', () => {

    const symbol = "kgh"; //sample company symbol
    const current = 131.35;

    beforeEach(() => {
        // Mock Finnhub API
        nock('https://finnhub.io')
            .get(/.*/)
            .reply(200, { c: 259.22, d: 5.23, dp: 2.0591, h: 262.165, l: 254.4701, o: 254.69, pc: 253.99, t: 1755892800 });

        // Mock Stooq API
        nock('https://stooq.pl')
            .get(/.*/)
            .reply(200, { "symbols": [{ "symbol": symbol, "date": "2025-08-22", "time": "17:00:54", "open": 130.3, "high": 132.85, "low": 129.8, "close": current, "volume": 586286 }] });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('should return 400 if symbol is missing', async () => {
        const res = await request(app).get('/api/getQuote?stock=NYSE');
        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if stock is missing', async () => {
        const res = await request(app).get('/api/getQuote?symbol=NVDA');
        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if both symbol and stock are missing', async () => {
        const res = await request(app).get('/api/getQuote');
        expect(res.statusCode).toBe(400);
        expect(res.text).toMatch(/missing/i);
    });

    it('should return quote for NYSE stock', async () => {
        nock.cleanAll();
        nock('https://finnhub.io')
            .get(/.*/)
            .reply(200, { c: 259.22, d: 5.23, dp: 2.0591, h: 262.165, l: 254.4701, o: 254.69, pc: 253.99, t: 1755892800 });

        const res = await request(app).get('/api/getQuote?symbol=NVDA&stock=NYSE');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('current'); // current price
    });

    it('should return quote for non-NYSE stock', async () => {
        nock.cleanAll();
        nock('https://stooq.pl')
            .get(/.*/)
            .reply(200, { "symbols": [{ "symbol": symbol, "date": "2025-08-22", "time": "17:00:54", "open": 130.3, "high": 132.85, "low": 129.8, "close": current, "volume": 586286 }] });

        const res = await request(app).get(`/api/getQuote?symbol=${symbol}&stock=GPW`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('current'); // current price
        expect(res.body.current).toBe(current); // Checking the value matches the mocked close price
    });

    it('should return 404 for NYSE stock with zero value', async () => {
        // Finnhub returns c: 0 for invalid symbol
        nock.cleanAll();
        nock('https://finnhub.io')
            .get(/.*/)
            .reply(200, {"c":0,"d":null,"dp":null,"h":0,"l":0,"o":0,"pc":0,"t":0});
        const res = await request(app).get('/api/getQuote?symbol=INVALID&stock=NYSE');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/not found/i);
    });

    it('should return 404 for non-NYSE stock with no close value', async () => {
        nock.cleanAll();
        nock('https://stooq.pl')
            .get(/.*/)
            .reply(200, { "symbols": [{ "symbol": "INVALID" }] });
        const res = await request(app).get('/api/getQuote?symbol=INVALID&stock=GPW');
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/not found/i);
    });
});