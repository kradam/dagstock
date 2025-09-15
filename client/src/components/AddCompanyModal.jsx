import React, { useState, useEffect } from 'react';
import './AddCompanyModal.css';

function AddCompanyModal({ isOpen, onClose, onAdd, stockExchanges, loading }) {
  const [companyName, setCompanyName] = useState('');
  const [companySymbol, setCompanySymbol] = useState('');
  const [selectedExchangeId, setSelectedExchangeId] = useState('');
  const [quantity, setQuantity] = useState();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCompanyName('');
      setCompanySymbol('');
      setSelectedExchangeId(stockExchanges[0]?.id || '');
      setQuantity("");
      setError('');
    }
  }, [isOpen, stockExchanges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!companyName.trim() || !companySymbol.trim() || !selectedExchangeId) {
      setError('All fields are required.');
      return;
    }
    if (!/^[A-Z]{1,10}$/.test(companySymbol)) {
      setError('Symbol must be 1-10 capital letters.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be positive.');
      return;
    }
    const selectedExchangeObj = stockExchanges.find(ex => ex.id == selectedExchangeId);
    console.log(stockExchanges);
    console.log(selectedExchangeId);
    console.log(selectedExchangeObj);
    const selectedExchangeName = selectedExchangeObj ? selectedExchangeObj.name : '';
    await onAdd({ companyName, companySymbol, selectedExchangeId, selectedExchangeName, quantity, setError });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-right">
      <div className="modal-right">
        <h2>Add New Company</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Company Name:
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </label>
          <label>
            Symbol:
            <input type="text" value={companySymbol} onChange={e => setCompanySymbol(e.target.value.toUpperCase())} maxLength={10} />
          </label>
          <label>
            Stock Exchange:
            <select value={selectedExchangeId} onChange={e => setSelectedExchangeId(e.target.value)}>
              {stockExchanges.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantity:
            <input type="number" value={quantity} min={1} onChange={e => setQuantity(Number(e.target.value))} />
          </label>
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCompanyModal;
