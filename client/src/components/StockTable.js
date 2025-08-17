import React, { useState, useEffect, useMemo } from 'react';
import StockRow from './StockRow';
import { MASTER_CURRENCY } from '../config/appConfig';

// Stock table component
function StockTable({ initialStocks, filterText, inStockOnly }) {

  // Format master currency
  // const formatMasterCurrency = (amount) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: MASTER_CURRENCY,
  //     minimumFractionDigits: 0
  //   }).format(amount);
  // };

  // // Format currency with thousand separators
  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 2
  //   }).format(amount);
  // };

  const [stocks, setStocks] = useState(initialStocks)

  useEffect(() => {
    setStocks(initialStocks);
  }, [initialStocks]);

  
  const totalValue = useMemo(
    () => stocks.reduce((sum, stock) => 
      sum + (stock.quantity * stock.price * (stock.stock_exchanges.currencies.ratio_to_master_currency || 1)), 0),
    [stocks]
  );

    // Calculate total value from all stocks for percent calculation
  // var totalValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0);
  // console.log("Total Portfolio Value:", totalValue);

  // Handle quantity changes
  const handleQuantityChange = (id, newQuantity) => {
    setStocks(prevStocks =>
      prevStocks.map(stock =>
        stock.id === id ? { ...stock, quantity: newQuantity } : stock
      )
    );
  };
  
  const filteredStocks = stocks.filter(stock =>
    stock.company_name.toLowerCase().startsWith(filterText.toLowerCase())
  );

  // Calculate value in master currency for each stock
  // const filteredStocksWithMasterValue = filteredStocks.map(stock => ({
  //   ...stock,
  //   valueMaster: stock.quantity * stock.price * (stock.ratio_to_master_currency || 1)
  // }));

  // Calculate total portfolio value in master currency
  // const totalMasterValue = filteredStocksWithMasterValue.reduce((sum, stock) => sum + stock.valueMaster, 0);


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
