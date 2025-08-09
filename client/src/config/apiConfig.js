class ApiConfig {
  constructor() {
    this.config = {
      finnhub: {
        apiKey: process.env.REACT_APP_FINNHUB_API_KEY,
        baseUrl: 'https://finnhub.io/api/v1'
      },
      alphaVantage: {
        apiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
        baseUrl: 'https://www.alphavantage.co/query'
      }
    };
  }

  getFinnhubConfig() {
    return this.config.finnhub;
  }

  getAlphaVantageConfig() {
    return this.config.alphaVantage;
  }

  isConfigured() {
    return !!(this.config.finnhub.apiKey && this.config.alphaVantage.apiKey);
  }
}

export default new ApiConfig();