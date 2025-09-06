//TODO notification library - research
function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      backgroundColor: '#ffeaa7',
      color: '#2d3436',
      padding: '10px 15px',
      margin: '10px 0',
      borderRadius: '4px',
      border: '1px solid #fdcb6e',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span>⚠️ {message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          color: '#636e72'
        }}
      >
        ×
      </button>
    </div>
  );
}

export default Notification;
