import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form className="auth-form-container" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />
      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">Login successful!</div>}
      <div className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </form>
  );
};

export default Login;