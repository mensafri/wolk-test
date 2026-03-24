import { useState } from 'react';
import { login, register } from '../api';

export default function Login({ setToken }: { setToken: (t: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await login({ username, password });
        setToken(res.token);
      } else {
        await register({ username, password });
        setIsLogin(true); // switch to login after successful register
        alert('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24">
      {/* Decorative Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
          Captain's Mode
        </h1>
        <p className="text-dota-gold uppercase tracking-[0.15em] text-sm mt-2 opacity-80">
          Authentication Required
        </p>
      </div>

      {/* Main Panel */}
      <div className="dota-panel p-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dota-gold to-transparent opacity-50"></div>
        
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider border-b border-dota-border pb-3">
          {isLogin ? 'Enter The Battle' : 'Enlist Now'}
        </h2>
        
        {error && (
          <div className="bg-dota-dire/20 border-l-4 border-dota-dire text-white p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-dota-muted uppercase mb-1.5 tracking-wider">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="dota-input"
              placeholder="e.g., Puppey"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dota-muted uppercase mb-1.5 tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="dota-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="dota-btn dota-btn-primary w-full mt-6 py-3 text-sm"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-dota-border pt-6">
          <p className="text-dota-muted text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-dota-gold hover:text-white transition-colors border-b border-dota-gold/30 hover:border-white uppercase tracking-wider text-xs ml-2"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        {/* Demo Account Box */}
        <div className="mt-8 bg-dota-dark/80 border border-dota-border/50 p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-dota-muted mb-1">Demo Credentials</p>
          <p className="text-sm font-mono text-dota-gold">testuser / password123</p>
        </div>
      </div>
    </div>
  );
}
