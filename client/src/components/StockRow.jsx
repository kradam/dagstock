
import React, { useState, useEffect } from 'react';

function StockRow({ stock, onQuantityChange }) {
  const { value, masterCurrencyValue, percentOfPortfolio } = stock;

  // Local state for the input value
  const [inputValue, setInputValue] = useState(stock.quantity);

  // Keep local input in sync with prop changes
  useEffect(() => {
    setInputValue(stock.quantity);
  }, [stock.quantity]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };


  const saveQuantity = () => {
    const newQuantity = parseFloat(inputValue) || 0;
    if (newQuantity !== stock.quantity) {
      onQuantityChange(stock.id, newQuantity);
    }
  };

  const handleInputBlur = () => {
    saveQuantity();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveQuantity();
      e.target.blur(); // Optionally blur to provide visual feedback
    }
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
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min="0"
          className="quantity-input"
          onKeyDown={handleInputKeyDown}
        />
      </td>
      <td className="currency">
        {stock.stock_exchanges.currencies.name}
      </td>
      <td className="price">
        {stock.price.toLocaleString()}
      </td>
      <td className="value">
        {Math.round(value).toLocaleString()}
      </td>
      <td className="value">
        {Math.round(masterCurrencyValue).toLocaleString()}
      </td>
      <td className="percent">
        {percentOfPortfolio}
      </td>
    </tr>
  );
}

export default StockRow;
