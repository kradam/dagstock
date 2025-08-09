import React from 'react';

// Stock row component
function StockRow({ stock, onQuantityChange }) {
  const totalValue = stock.quantity * stock.price;
  
  // Format numbers with thousand separators
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 0;
    onQuantityChange(stock.symbol, newQuantity);
  };
  
  return (
    <tr className="stock-row">
      <td className="share-name">
        {stock.name} ({stock.symbol})
      </td>
      <td className="quantity">
        <input 
          type="number" 
          value={stock.quantity} 
          onChange={handleQuantityChange}
          min="0"
          className="quantity-input"
        />
      </td>
      <td className="price">
        {formatCurrency(stock.price)}
      </td>
      <td className="value">
        {formatCurrency(totalValue)}
      </td>
    </tr>
  );
}

export default StockRow;
