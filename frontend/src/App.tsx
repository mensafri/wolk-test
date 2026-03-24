import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DraftPlansList from './pages/DraftPlansList';
import DraftPlanDetail from './pages/DraftPlanDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <header className="bg-slate-800 shadow-md p-4 border-b border-slate-700">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Dota 2 Draft Plans
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DraftPlansList />} />
            <Route path="/draft/:id" element={<DraftPlanDetail />} />
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
