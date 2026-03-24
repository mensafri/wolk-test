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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <header className="bg-slate-800 shadow-md p-4 border-b border-slate-700">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Dota 2 Draft Plans
            </Link>
            {token && (
              <button onClick={() => setToken(null)} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition">Logout</button>
            )}
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
            <Route path="/" element={token ? <DraftPlansList /> : <Navigate to="/login" />} />
            <Route path="/draft/:id" element={token ? <DraftPlanDetail /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="py-6 text-center text-slate-500 text-sm border-t border-slate-800">
          Built for Take-Home Assessment
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
