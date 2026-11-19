import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import './Login.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api.register({ email, password, display_name: displayName });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Game Journal</h1>
        <p className="login-subtitle">Create your account</p>

        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit">Register</button>

        {error && <p className="login-message">{error}</p>}
        <p className="login-message">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
