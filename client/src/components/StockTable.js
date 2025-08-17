import React, { useState, useEffect, useMemo } from 'react';
import StockRow from './StockRow';

// Stock table component
function StockTable({ initialStocks, filterText, inStockOnly }) {

//  console.log("Initial stocks :", initialStocks);
  const [stocks, setStocks] = useState(initialStocks)

  useEffect(() => {
    setStocks(initialStocks);
  }, [initialStocks]);

  //console.log("Stocks:", stocks);

  

  // Format currency with thousand separators
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const totalValue = useMemo(
    () => stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0),
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
    // var totalValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0);
  };
  
  // Filter stocks by share-name starting with filterText, case insensitive
  const filteredStocks = stocks.filter(stock =>
    stock.company_name.toLowerCase().startsWith(filterText.toLowerCase())
  );


  return (
    <div className="stock-portfolio">
      <h1>Stock Portfolio</h1>
      <table className="stock-table">
        <thead>
          <tr>
            <th className="share-name">Company Name</th>
            <th className="share-name">Symbol</th>
            <th className="stock-exchange-name">Stock Exchange</th>
            <th className="quantity">Quantity</th>
            <th className="currency">Currency</th>
            <th className="price">Price</th>
            <th className="value">Value</th>
            <th className="percent">% of Portfolio</th>
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
          <tr className="total-row</tr>">
            <td className="share-name" colSpan="6"><strong>Total Portfolio Value</strong></td>
            <td className="value"><strong>{formatCurrency(totalValue)}</strong></td>
            <td className="percent"><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default StockTable;
