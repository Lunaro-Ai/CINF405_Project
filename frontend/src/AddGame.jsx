import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import './Login.css';

const STATUSES = ['Want to Play', 'Playing', 'Completed', 'Dropped'];

const AddGame = () => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [status, setStatus] = useState('Want to Play');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const entry = await api.addEntry({
        title,
        platform: platform || undefined,
        release_year: releaseYear ? parseInt(releaseYear) : undefined,
        status,
      });
      navigate(`/entries/${entry.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Add a game</h1>
        <p className="login-subtitle">Add a game to your journal</p>

        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />

        <label htmlFor="platform">Platform</label>
        <input
          id="platform"
          type="text"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          placeholder="PC, PS5, Switch..."
          maxLength={100}
        />

        <label htmlFor="year">Release year</label>
        <input
          id="year"
          type="number"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
          min={1970}
          max={2030}
        />

        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '10px',
            marginBottom: '8px',
            border: '1px solid #444',
            borderRadius: '4px',
            background: '#0d0d0d',
            color: '#f2f2f2',
            fontSize: '1rem',
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button type="submit">Add to journal</button>

        {error && <p className="login-message">{error}</p>}
        <p className="login-message">
          <Link to="/dashboard">← Back to journal</Link>
        </p>
      </form>
    </main>
  );
};

export default AddGame;
