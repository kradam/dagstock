import React, { useState, useEffect, useMemo } from 'react';
import StockRow from './StockRow.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import Notification from './Notification.jsx';
import { MASTER_CURRENCY } from '../config/appConfig';
import { supabase as supabaseClient } from '../supabaseClient';

function StockTable({ filterText, inStockOnly }) {

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    getStocks();
  }, []);

  async function getStocks() {
    // console.log('getStocks called at:', new Date().toISOString());
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
      setStocks([]);
      setLoading(false);
      alert(`Error connecting to database:\n${error.message}`);
      console.error(`Error connecting to database:\n${error.message}`);
    } else {

      let getQuoteFailed = false;
      const updatedStocks = await Promise.all(
        data.map(async (stock) => {
          try {
            const res = await fetch(`/api/getQuote?symbol=${stock.company_symbol}&stock=${stock.stock_exchanges.name}`);
            const quote = await res.json();
            // Replace price with latest value from API (assuming quote.c is the price)
            return { ...stock, price: quote.current };
          } catch (err) {
            // If API fails, keep original price
            getQuoteFailed = true;
            console.warn(`Failed to fetch quote for ${stock.company_symbol}:`, err);
            return stock;
          }
        })
      );

      setStocks(updatedStocks);
      setLoading(false);

      if (getQuoteFailed) {
        setNotification('Some stock quotes could not be updated. Using cached prices.');
        setTimeout(() => setNotification(null), 5000); // Hide after 5 seconds
      }

    }
  }


  const totalValue = useMemo(
    () => stocks.reduce((sum, stock) =>
      sum + (stock.quantity * stock.price * (stock.stock_exchanges.currencies.ratio_to_master_currency || 1)), 0),
    [stocks]
  );

  const handleQuantityChange = async (id, newQuantity) => {
    const originalStocks = stocks; // Keep a copy of the original state
    setLoading(true);

    // Optimistically update the UI first
    setStocks(prevStocks =>
      prevStocks.map(stock =>
        stock.id === id ? { ...stock, quantity: newQuantity } : stock
      )
    );

    const { error, data } = await supabaseClient
      .from('stocks')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select('*', { count: 'exact' }); // Request the count of affected rows

    // console.log("data:", data);
    // console.log("data.length", data.length);
    const count = data?.length || 0; // Number of rows updated
    // Check for any failure condition (direct error OR no rows updated)
    if (error || !count) {
      const errorMessage = error
        ? error.message
        : 'You do not have permission to update this stock.';
      console.error('Failed to update quantity:', errorMessage);
      setNotification(`Update failed: ${errorMessage}`);
      setStocks(originalStocks); // Revert the UI to its original state
    }

    setLoading(false);
    // Set a timeout to clear the notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.company_name.toLowerCase().startsWith(filterText.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner title="Stock Portfolio" message="Updating stocks..." />;
  }

  return (
    <div className="stock-portfolio">
      <h1>Stock Portfolio</h1>

      <Notification message={notification} onClose={() => setNotification(null)} />

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
