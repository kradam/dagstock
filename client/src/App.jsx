import './App.css';
import FilterableStockTable from './components/FilterableStockTable';
import { stockData } from './data/stockData';
import { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);


function App() {

  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getStocks();
  }, []);

  async function getStocks() {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        id, company_symbol, company_name, quantity, price,
        stock_exchanges (
          name,
          currencies (
            name, ratio_to_master_currency
          )
        )
      `);

    if (error) {
      console.error("Error fetching stocks:", error);
    } else {

      // Fetch latest price for each stock
      const updatedStocks = await Promise.all(
        data.map(async (stock) => {
          try {
            const res = await fetch(`/api/getQuote?symbol=${stock.company_symbol}&stock=${stock.stock_exchanges.name}`);
            const quote = await res.json();
            // Replace price with latest value from API (assuming quote.c is the price)
            return { ...stock, price: quote.current };
          } catch (err) {
            // If API fails, keep original price
            return stock;
          }
        })
      );

      setStocks(updatedStocks);
    }
  }

  return (
    // <ul>
    //   {stocks.map((stock) => (
    //     <li key={stock.exchange}>{stock.company_symbol} {stocks.length}</li>
    //   ))}
    // </ul>    
    <div className="App">
      <FilterableStockTable initialStocks={stocks} />
    </div>
  );
}

export default App; 
