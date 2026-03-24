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
    <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        {isLogin ? 'Login to Draft Plans' : 'Register New Account'}
      </h2>
      
      {error && <div className="bg-rose-500/20 text-rose-400 p-3 rounded mb-4 text-center text-sm border border-rose-500/50">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 mt-4"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-400 hover:text-emerald-300 font-medium">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500 text-center">
        Test Account:<br />
        testuser / password123
      </div>
    </div>
  );
}
