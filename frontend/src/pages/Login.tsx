import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await login({ username, password });
        localStorage.setItem('token', res.token);
        navigate('/');
      } else {
        await register({ username, password });
        alert('Account created! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-tactical-bg min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <div className="mb-6">
          <h2 className="text-[24px] font-bold tracking-tight text-tactical-text-primary">
            {isLogin ? 'Sign in' : 'Create an account'}
          </h2>
          <p className="text-[14px] text-tactical-text-secondary mt-2">
            Secure connection to tactical drafting dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-tactical-error rounded-sm text-tactical-text-primary text-[14px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-tactical-text-primary" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="coordinator_01"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-tactical-text-primary" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 border-t border-tactical-border pt-6 text-center">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[14px] text-tactical-secondary hover:text-tactical-secondary-hover font-medium transition-colors cursor-pointer"
          >
            {isLogin ? 'Create an account' : 'Already enlisted? Sign in'}
          </button>
          
          <div className="mt-4 text-[12px] text-tactical-text-secondary">
            Demo Account: <span className="text-tactical-text-primary">testuser</span> / <span className="text-tactical-text-primary">password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
