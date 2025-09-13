import React from 'react';
import StockRow from './StockRow';
import { MASTER_CURRENCY } from '../config/appConfig';

function StockTableContent({ filteredStocks, totalValue, handleQuantityChange }) {
  return (
    <table className="stock-table">
      <thead>
        <tr>
          <th className="share-name">Company Name</th>
          <th className="share-name">Symbol</th>
          <th className="stock-exchange-name">Stock<br />Exch.</th>
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
  );
}

export default StockTableContent;
