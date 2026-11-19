import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getEntries();
        setEntries(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statuses = ['All', 'Want to Play', 'Playing', 'Completed', 'Dropped'];
  const filtered = filter === 'All' ? entries : entries.filter((e) => e.status === filter);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#e63946', margin: 0 }}>Game Journal</h1>
        <div>
          <span style={{ color: '#aaa', marginRight: '12px' }}>{user.display_name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filter === s ? '#c8102e' : 'transparent',
              color: filter === s ? '#fff' : '#aaa',
              border: '1px solid #333',
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
        <Link
          to="/entries/new"
          style={{
            marginLeft: 'auto',
            background: '#c8102e',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          + Add game
        </Link>
      </div>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {filtered.length === 0 && <p style={{ color: '#666' }}>No games yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {filtered.map((entry) => (
          <Link
            key={entry.id}
            to={`/entries/${entry.id}`}
            style={{
              background: '#1a1a1a',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #2a2a2a',
              textDecoration: 'none',
              color: '#f2f2f2',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '8px' }}>{entry.status}</div>
            <h2 style={{ margin: 0, fontSize: '1rem' }}>{entry.title}</h2>
            {entry.platform && <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.8rem' }}>{entry.platform}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
