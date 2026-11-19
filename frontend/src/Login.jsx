import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await api.login({ email, password });
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
        <p className="login-subtitle">Log in to your journal</p>

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

        <button type="submit">Log in</button>

        {error && <p className="login-message">{error}</p>}
        <p className="login-message">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
