import './App.css';
import FilterableStockTable from './components/FilterableStockTable';
import { stockData } from './data/stockData';
import apiConfig from './config/apiConfig';
import { useEffect } from 'react';


function App() {

   useEffect(() => {
    console.log('=== API Configuration ===');
    // console.log('Environment:', apiConfig.getEnvironment());
    console.log('Finnhub API Key:', apiConfig.getFinnhubConfig().apiKey || 'NOT SET');
    // console.log('Alpha Vantage API Key:', apiConfig.getAlphaVantageConfig().apiKey || 'NOT SET');
    // console.log('API Keys Configured:', apiConfig.isConfigured());
    // console.log('Should Use Mock Data:', apiConfig.shouldUseMockData());
    console.log('========================');
  }, []);

  return (
    <div className="App">
      <FilterableStockTable initialStocks={stockData} />
    </div>
  );
}

export default App; 
