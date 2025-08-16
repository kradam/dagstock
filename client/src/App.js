import './App.css';
import FilterableStockTable from './components/FilterableStockTable';
import { stockData } from './data/stockData';
import apiConfig from './config/apiConfig';
import { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);


function App() {

  const [stocks, setStocks] = useState([]);

   useEffect(() => {
     getStocks();
   }, []);

  async function getStocks() {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        company_symbol, company_name, quantity, price,
        stock_exchanges (
          name,
          currencies (
            name
          )
        )
      `);
      
    if (error) {
      console.error("Error fetching stocks:", error);
    } else {
      setStocks(data);
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
