

import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import Notification from './Notification.jsx';
import StockTableContent from './StockTableContent.jsx';
import PortfolioBarChart from './PortfolioBarChart.jsx';
import useStocks from '../hooks/useStocks';

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

  if (loading) {
    return <LoadingSpinner title="Stock Portfolio" message="Loading stocks..." />;
  }

  return (
    <div className="stock-portfolio">
      <h1>Stock Portfolio</h1>
      <Notification message={notification} onClose={() => setNotification(null)} />
      <StockTableContent
        filteredStocks={filteredStocks}
        totalValue={totalValue}
        handleQuantityChange={handleQuantityChange}
      />
      <PortfolioBarChart stocks={filteredStocks} totalValue={totalValue} />
    </div>
  );
}

export default StockTable;
