import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import DraftPlansList from './pages/DraftPlansList';
import DraftPlanDetail from './pages/DraftPlanDetail';
import Login from './pages/Login';
import { useEffect, useState } from 'react';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col items-center">
        <header className="w-full bg-dota-dark border-b-2 border-dota-gold/30 shadow-dota relative z-10">
          <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-dota-dire to-dota-radiant rounded-sm shadow-glow rotate-45 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <div className="w-4 h-4 bg-dota-dark rotate-45"></div>
              </div>
              <span className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-dota-gold to-yellow-200">
                Dota Drafts
              </span>
            </Link>
            {token && (
              <button onClick={() => setToken(null)} className="dota-btn dota-btn-secondary text-[10px]">
                SIGN OUT
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl container mx-auto p-4 sm:p-6 lg:padding-8 relative z-0">
          <Routes>
            <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
            <Route path="/" element={token ? <DraftPlansList /> : <Navigate to="/login" />} />
            <Route path="/draft/:id" element={token ? <DraftPlanDetail /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="w-full py-8 text-center text-dota-muted text-xs uppercase tracking-[0.2em] border-t border-dota-border bg-dota-dark/50">
          Built for Take-Home Assessment
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
