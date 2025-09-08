import { useState, useEffect, useMemo } from 'react';
import { supabase as supabaseClient } from '../supabaseClient';

export default function useStocks(filterText) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    getStocks();
    // eslint-disable-next-line
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
      setStocks([]);
      setLoading(false);
      setNotification(`Error connecting to database: ${error.message}`);
    } else {
      let getQuoteFailed = false;
      const updatedStocks = await Promise.all(
        data.map(async (stock) => {
          try {
            const res = await fetch(`/api/getQuote?symbol=${stock.company_symbol}&stock=${stock.stock_exchanges.name}`);
            const quote = await res.json();
            return { ...stock, price: quote.current };
          } catch (err) {
            getQuoteFailed = true;
            return stock;
          }
        })
      );
      setStocks(updatedStocks);
      setLoading(false);
      if (getQuoteFailed) {
        setNotification('Some stock quotes could not be updated. Using cached prices.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  }

  const totalValue = useMemo(
    () => stocks.reduce((sum, stock) =>
      sum + (stock.quantity * stock.price * (stock.stock_exchanges.currencies.ratio_to_master_currency || 1)), 0),
    [stocks]
  );

  const handleQuantityChange = async (id, newQuantity) => {
    const originalStocks = stocks;
    setStocks(prevStocks =>
      prevStocks.map(stock =>
        stock.id === id ? { ...stock, quantity: newQuantity } : stock
      )
    );
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('stocks')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select();
    if (error || !data || data.length === 0) {
      const errorMessage = error ? error.message : 'You do not have permission to update this stock.';
      setNotification(`Update failed: ${errorMessage}`);
      setStocks(originalStocks);
    }
    setLoading(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.company_name.toLowerCase().startsWith(filterText.toLowerCase())
  );

  return {
    stocks,
    filteredStocks,
    loading,
    notification,
    setNotification,
    totalValue,
    handleQuantityChange,
  };
}
