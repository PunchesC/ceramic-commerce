import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login(email, password);
    navigate('/'); // or navigate('/orders');
  } catch (err: any) {
    setError(err.message);
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {success && <div style={{color:'green'}}>Login successful!</div>}
    </form>
  );
};

export default Login;