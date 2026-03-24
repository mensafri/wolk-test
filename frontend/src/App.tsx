import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import DraftPlansList from './pages/DraftPlansList';
import DraftPlanDetail from './pages/DraftPlanDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-tactical-text-primary font-sans flex flex-col relative overflow-hidden">
      <header className="h-[64px] border-b border-tactical-border/50 bg-tactical-surface/40 backdrop-blur-md flex items-center px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-tactical-primary flex items-center justify-center font-bold text-white shadow-shadow-glow">
            D2
          </div>
          <span className="text-[20px] font-bold tracking-tight">Strategy Center</span>
        </div>
        <div className="ml-auto">
          {token && (
            <button onClick={handleLogout} className="btn btn-secondary text-[14px]">
              Sign Out
            </button>
          )}
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><DraftPlansList /></ProtectedRoute>} />
          <Route path="/draft/:id" element={<ProtectedRoute><DraftPlanDetail /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
