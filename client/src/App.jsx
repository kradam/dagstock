import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import FilterableStockTable from './components/FilterableStockTable';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="App">
      {!session ? (
        <Login />
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', position: 'relative' }}>
            <h1 style={{ flex: 1, textAlign: 'center', margin: 0 }}>Stock Portfolio</h1>
            <button onClick={handleLogout} style={{ position: 'absolute', right: 0 }}>Logout</button>
          </div>
          <FilterableStockTable key={session.user.id} />
        </div>
      )}
    </div>
  );
}

export default App; 
