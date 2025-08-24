const request = require('supertest');
const app = require('../index'); // Adjust if your Express app is exported

describe('GET /api/getQuote', () => {
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
    const res = await request(app).get('/api/getQuote?symbol=PXM&stock=GPW');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('current'); // current price
  });
});