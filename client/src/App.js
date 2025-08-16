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
    const { data } = await supabase.from("stocks").select();
    setStocks(data);
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
