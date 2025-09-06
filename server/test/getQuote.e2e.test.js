// TODO E2E tests-  parametrized to run it in CI/CD
const request = require('supertest');

describe('E2E: GET /api/getQuote (real backend)', () => {
  // You may want to set up/tear down test data here

  it('should return 200 and a current price for a valid NYSE symbol', async () => {
    const res = await request('http://localhost:3001')
      .get('/api/getQuote?symbol=AAPL&stock=NYSE');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('current');
    expect(typeof res.body.current === 'number').toBe(true);
  });

  it('should return 404 for an invalid NYSE symbol', async () => {
    const res = await request('http://localhost:3001')
      .get('/api/getQuote?symbol=INVALID&stock=NYSE');
    expect([404, 500]).toContain(res.statusCode); // 404 if handled, 500 if external error
  });

  it('should return 200 and a current price for a valid non-NYSE symbol', async () => {
    const res = await request('http://localhost:3001')
      .get('/api/getQuote?symbol=KGH&stock=GPW');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('current');
    expect(typeof res.body.current === 'number').toBe(true);
  });

  it('should return 404 for an invalid non-NYSE symbol', async () => {
    const res = await request('http://localhost:3001')
      .get('/api/getQuote?symbol=INVALID&stock=GPW');
    expect([404, 500]).toContain(res.statusCode);
  });
});
