import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, name);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form className="auth-form-container" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label htmlFor="register-name">Name</label>
      <input
        id="register-name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />
      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">Registration successful!</div>}
      <div className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </form>
  );
};

export default Register;