import React from 'react';

// Stock row component
function StockRow({ stock, onQuantityChange, totalValue }) {
  const totalStockValue = stock.quantity * stock.price;
  const percentOfPortfolio = totalValue > 0 ? ((totalStockValue / totalValue) * 100).toFixed(0) : "0";
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
    onQuantityChange(stock.id, newQuantity);
  };
  return (
    <tr className="stock-row">
      <td className="company-name">
        {stock.company_name}
      </td>
      <td className="company-name">
        {stock.company_symbol}
      </td>
      <td className="company-name">
        {stock.stock_exchanges.name}
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
      <td className="currency">
        {stock.stock_exchanges.currencies.name}
      </td>
      <td className="price">
        {formatCurrency(stock.price)}
      </td>
      <td className="value">
        {formatCurrency(totalStockValue)}
      </td>
      <td className="percent">
        {percentOfPortfolio}%
      </td>
    </tr>
  );
}

export default StockRow;
