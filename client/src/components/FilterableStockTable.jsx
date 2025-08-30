import { useState, useEffect } from 'react';
import StockTable from './StockTable.jsx';
import SearchBar from './SearchBar';

function FilterableStockTable() {
  const [filterText, setFilterText] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [title, setTitle] = useState('');

    return (
    <div>
      <h2>{title}</h2>
      <SearchBar 
        filterText={filterText} 
        inStockOnly={inStockOnly} 
        onFilterTextChange={setFilterText} 
        onInStockOnlyChange={setInStockOnly} />
      <StockTable 
        filterText={filterText}
        inStockOnly={inStockOnly} />
    </div>
  );
}

export default FilterableStockTable;