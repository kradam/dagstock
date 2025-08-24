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
            .reply(200,  { c: 259.22, d: 5.23, dp: 2.0591, h: 262.165, l: 254.4701, o: 254.69, pc: 253.99, t: 1755892800});

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

    it('should return quote for NYSE stock', async () => {
        const res = await request(app).get('/api/getQuote?symbol=NVDA&stock=NYSE');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('current'); // current price
    });

    it('should return quote for non-NYSE stock', async () => {
        const res = await request(app).get(`/api/getQuote?symbol=${symbol}&stock=GPW`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('current'); // current price
        expect(res.body.current).toBe(current); // Checking the value matches the mocked close price
    });
});