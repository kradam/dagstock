import React, { useState } from 'react';
import StockRow from './StockRow';

// Stock table component
function StockTable({ initialStocks, filterText, inStockOnly }) {
  // Convert initialStocks array to a Map for efficient updates
  const [stocksMap, setStocksMap] = useState(() => {
    const map = new Map();
    initialStocks.forEach(stock => map.set(stock.symbol, stock));
    return map;
  });

  // Convert Map values to array for rendering and calculations
  const stocks = Array.from(stocksMap.values());

  // Calculate total portfolio value
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0);
  
  // Format currency with thousand separators
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle quantity changes
  const handleQuantityChange = (symbol, newQuantity) => {
    setStocksMap(prevMap => {
      const newMap = new Map(prevMap);
      const stock = newMap.get(symbol);
      if (stock) {
        newMap.set(symbol, { ...stock, quantity: newQuantity });
      }
      return newMap;
    });
  };
  
  // Filter stocks by share-name starting with filterText, case insensitive
  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().startsWith(filterText.toLowerCase())
  );

  return (
    <div className="stock-portfolio">
      <h1>Stock Portfolio</h1>
      <table className="stock-table">
        <thead>
          <tr>
            <th className="share-name">Share Name</th>
            <th className="quantity">Quantity</th>
            <th className="price">Price ($)</th>
            <th className="value">Value ($)</th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map((stock) => (
            <StockRow 
              key={stock.symbol} 
              stock={stock} 
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td className="share-name"><strong>Total Portfolio Value</strong></td>
            <td className="quantity"></td>
            <td className="price"></td>
            <td className="value"><strong>{formatCurrency(
              filteredStocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0)
            )}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default StockTable;
