import LoadingSpinner from './LoadingSpinner.jsx';
import Notification from './Notification.jsx';
import StockTableContent from './StockTableContent.jsx';
import PortfolioBarChart from './PortfolioBarChart.jsx';
import useStocks from '../hooks/useStocks';
import AddCompanyModal from './AddCompanyModal.jsx';
import * as Sentry from '@sentry/react';
import { supabase as supabaseClient } from '../supabaseClient';
import React from 'react';

function StockTable({ filterText, inStockOnly }) {

  const {
    stocks,
    filteredStocks,
    loading,
    notification,
    setNotification,
    totalValue,
    handleQuantityChange,
  } = useStocks(filterText);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [stockExchanges, setStockExchanges] = React.useState([]);
  const [addLoading, setAddLoading] = React.useState(false);

  React.useEffect(() => {
    if (modalOpen) {
      // Fetch stock exchanges from Supabase
      supabaseClient
        .from('stock_exchanges')
        .select('id, name')
        .then(({ data, error }) => {
          if (error) {
            Sentry.captureException(error);
            setStockExchanges([]);
          } else {
            setStockExchanges(data || []);
          }
        });
    }
  }, [modalOpen]);

  const handleAddCompany = async ({ companyName, companySymbol,selectedExchangeId, selectedExchangeName, quantity, setError }) => {
    setAddLoading(true);
    setError('');
    // Check if symbol is unique
    const { data: existing, error: existError } = await supabaseClient
      .from('stocks')
      .select('company_symbol')
      .eq('company_symbol', companySymbol);
    if (existError) {
      Sentry.captureException(existError);
      setError('Error checking symbol uniqueness.');
      setAddLoading(false);
      return;
    }
    if (existing && existing.length > 0) {
      setError('Symbol must be unique.');
      setAddLoading(false);
      return;
    }
    // Check if quote is available
    var quote;
    try {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${apiUrl}/api/getQuote?symbol=${companySymbol}&stock=${selectedExchangeName}`);
      if (!res.ok) throw new Error('Quote fetch failed');
      quote = await res.json();
      if (!quote.current) throw new Error('No quote found');
    } catch (err) {
      setError('Cannot fetch quote for this symbol and exchange.');
      setAddLoading(false);
      return;
    }
    // Insert new company
    const { error: insertError } = await Sentry.startSpan(
      {
        op: "db.query",
        name: "Insert new company stock",
      },
      async () => {
        return await supabaseClient
          .from('stocks')
          .insert({
            company_name: companyName,
            company_symbol: companySymbol,
            stock_exchange_id: selectedExchangeId,
            price: quote.current,
            quantity
          });
      }
    );
    if (insertError) {
      Sentry.captureException(insertError);
      setError('Error saving to database.');
      setAddLoading(false);
      return;
    }
    setModalOpen(false);
    setAddLoading(false);
    setNotification('Company added!');
    setTimeout(() => setNotification(null), 3000);
    // Optionally, refresh stocks
    window.location.reload();
  };

  if (loading) {
    return <LoadingSpinner message="Loading stocks..." />;
  }

  return (
    <div className="stock-portfolio">      
      <button onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>Add Company</button>
      <Notification message={notification} onClose={() => setNotification(null)} />
      <StockTableContent
        filteredStocks={filteredStocks}
        totalValue={totalValue}
        handleQuantityChange={handleQuantityChange}
      />
      <PortfolioBarChart stocks={filteredStocks} totalValue={totalValue} />
      <AddCompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddCompany}
        stockExchanges={stockExchanges}
        loading={addLoading}
      />
    </div>
  );
}

export default StockTable;


