import { useState, useEffect } from 'react';

type HeroBrowserProps = {
  mode: 'BAN' | 'PICK';
  onClose: () => void;
  onSelect: (heroId: number, name: string) => void;
};

export default function HeroBrowser({ mode, onClose, onSelect }: HeroBrowserProps) {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.opendota.com/api/heroes')
      .then(res => res.json())
      .then(data => {
        setHeroes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch heroes', err);
        setLoading(false);
      });
  }, []);

  const filtered = heroes.filter(h => 
    h.localized_name.toLowerCase().includes(search.toLowerCase()) ||
    h.roles.some((r: string) => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-tactical-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-strong border border-tactical-border relative overflow-hidden">
        {/* Dynamic header colors based on mode */}
        <div className={`h-2 w-full absolute top-0 left-0 ${mode === 'BAN' ? 'bg-tactical-error' : 'bg-tactical-success'}`}></div>
        
        <div className="p-6 border-b border-tactical-border flex justify-between items-center mt-2">
          <div>
            <h2 className="text-[24px] font-bold text-tactical-text-primary tracking-tight">
              {mode === 'BAN' ? 'Declare Ban Target' : 'Select Priority Pick'}
            </h2>
            <p className="text-[14px] text-tactical-text-secondary mt-1">Search the OpenDota registry to target a hero.</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary text-[12px] h-8 px-3">
            Cancel
          </button>
        </div>

        <div className="p-6 border-b border-tactical-border bg-tactical-surface-dark shrink-0">
          <input 
            type="text" 
            placeholder="Search heroes by name or role..." 
            className="input-field w-full max-w-md bg-tactical-surface"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-tactical-text-secondary text-[14px] tracking-widest uppercase">Connecting to OpenDota...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(hero => (
                <div key={hero.id} className="flex flex-col bg-tactical-surface-dark border border-tactical-border rounded-sm overflow-hidden hover:border-tactical-primary transition-colors group">
                  <div className="aspect-video bg-tactical-bg border-b border-tactical-border flex items-center justify-center relative overflow-hidden group-hover:bg-tactical-primary/10 transition-colors">
                     {/* No images provided, fallback to text representation */}
                     <span className="font-bold text-[14px] text-tactical-text-secondary group-hover:text-tactical-primary transition-colors text-center px-1">
                       {hero.localized_name}
                     </span>
                  </div>
                  <div className="p-3">
                     <div className="flex flex-wrap gap-1 mb-3">
                        {hero.roles.slice(0, 2).map((role: string) => (
                           <span key={role} className="text-[10px] px-1.5 py-0.5 bg-tactical-surface border border-tactical-border text-tactical-text-secondary font-medium tracking-wide rounded-sm truncate max-w-full">
                             {role}
                           </span>
                        ))}
                     </div>
                     <button 
                       className={`w-full text-[12px] h-8 font-bold tracking-wide transition-all border shrink-0 ${mode === 'BAN' ? 'bg-transparent text-tactical-error border-tactical-error hover:bg-tactical-error hover:text-white' : 'bg-transparent text-tactical-success border-tactical-success hover:bg-tactical-success hover:text-white'}`}
                       onClick={() => onSelect(hero.id, hero.localized_name)}
                     >
                       SELECT
                     </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-tactical-text-secondary">No heroes match your tactical parameters.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
