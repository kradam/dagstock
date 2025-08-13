import { useState, useEffect } from 'react';
import StockTable from './StockTable';
import SearchBar from './SearchBar';

function FilterableStockTable({ initialStocks }) {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch('/api/getQuote?symbol=ACN')
      .then(res => res.json())
      .then(data => setTitle(data.c || ''))
      .catch(() => setTitle(''));
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <SearchBar 
        filterText={filterText} 
        inStockOnly={inStockOnly} 
        onFilterTextChange={setFilterText} 
        onInStockOnlyChange={setInStockOnly} />
      <StockTable 
        initialStocks={initialStocks} 
        filterText={filterText}
        inStockOnly={inStockOnly} />
    </div>
  );
}

export default FilterableStockTable;