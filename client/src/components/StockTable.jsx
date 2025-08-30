import React, { useState, useEffect, useMemo } from 'react';
import StockRow from './StockRow.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { MASTER_CURRENCY } from '../config/appConfig';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function StockTable({ filterText, inStockOnly }) {

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStocks();
  }, []);

  async function getStocks() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('stocks')
      .select(`
        id, company_symbol, company_name, quantity, price,
        stock_exchanges (
          name,
          currencies (
            name, ratio_to_master_currency
          )
        )
      `)
      .order('company_name', { ascending: true });

    if (error) {
      console.error("Error fetching stocks:", error);
      setLoading(false);
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
      setLoading(false);
    }
  }

  
  const totalValue = useMemo(
    () => stocks.reduce((sum, stock) => 
      sum + (stock.quantity * stock.price * (stock.stock_exchanges.currencies.ratio_to_master_currency || 1)), 0),
    [stocks]
  );

  const handleQuantityChange = async (id, newQuantity) => {
    setStocks(prevStocks =>
      prevStocks.map(stock =>
        stock.id === id ? { ...stock, quantity: newQuantity } : stock
      )
    );
    // Save the new quantity to Supabase
    const { error } = await supabaseClient
      .from('stocks')
      .update({ quantity: newQuantity })
      .eq('id', id);
    if (error) {
      console.error('Error updating quantity in Supabase:', error);
    }
  };
  
  const filteredStocks = stocks.filter(stock =>
    stock.company_name.toLowerCase().startsWith(filterText.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner title="Stock Portfolio" message="Loading stocks..." />;
  }

  return (
    <div className="stock-portfolio">
      <h1>Stock Portfolio</h1>
      <table className="stock-table">
        <thead>
          <tr>
            <th className="share-name">Company Name</th>
            <th className="share-name">Symbol</th>
            <th className="stock-exchange-name">Stock<br />Exchange</th>
            <th className="quantity">Quantity</th>
            <th className="currency">Curr.</th>
            <th className="price">Price</th>
            <th className="value">Value</th>
            <th className="value-master">Value <br /> {MASTER_CURRENCY}</th>
            <th className="percent">% of<br />Portf.</th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map((stock) => (
            <StockRow 
              key={stock.company_symbol} 
              stock={stock}
              totalValue={totalValue}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td className="share-name" colSpan="7"><strong>Total Portfolio Value</strong></td>
            <td className="value-master"><strong>{Math.round(totalValue).toLocaleString()}</strong></td>
            <td className="percent"><strong>100</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default StockTable;
