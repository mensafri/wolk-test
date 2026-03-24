import { useQuery } from '@tanstack/react-query';
import { getHeroes } from '../api';
import type { HeroCache } from '../types';
import { useState, useMemo } from 'react';

interface HeroBrowserProps {
  onSelectHero: (hero: HeroCache) => void;
  onClose: () => void;
  hideHeroes?: number[];
  title?: string;
}

export default function HeroBrowser({ onSelectHero, onClose, hideHeroes = [], title="Hero Browser" }: HeroBrowserProps) {
  const [search, setSearch] = useState('');
  
  const { data: heroes, isLoading } = useQuery({
    queryKey: ['heroes'],
    queryFn: getHeroes,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const filteredHeroes = useMemo(() => {
    if (!heroes) return [];
    return heroes.filter(h => 
      !hideHeroes.includes(h.id) && 
      (h.localizedName.toLowerCase().includes(search.toLowerCase()) || 
       h.roles.some(r => r.toLowerCase().includes(search.toLowerCase())))
    );
  }, [heroes, search, hideHeroes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-dota-panel border border-dota-gold/30 rounded-sm shadow-dota w-full max-w-5xl h-[85vh] flex flex-col relative">
        <div className="p-4 border-b border-dota-border bg-dota-dark flex justify-between items-center">
          <h2 className="text-xl font-black tracking-widest uppercase text-dota-gold">{title}</h2>
          <button onClick={onClose} className="dota-btn border-none hover:text-dota-dire">Close ✕</button>
        </div>
        
        <div className="p-4 bg-dota-panel border-b border-dota-border">
          <input 
            type="text"
            placeholder="Search heroes by name or role..."
            className="dota-input w-full max-w-md"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-20 text-dota-gold uppercase tracking-widest animate-pulse">Loading Heroes Archives...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredHeroes.map(hero => (
                <div key={hero.id} className="bg-dota-dark border border-dota-border hover:border-dota-gold/50 rounded-sm overflow-hidden group transition-colors flex flex-col shadow-inner">
                  {/* Since image URLs from OpenDota are relative sometimes, we use initials if no image is rendered to be safe, but we'll try to show the name prominently */}
                  <div className="h-24 bg-gradient-to-b from-[#2a3038] to-[#14161a] border-b border-dota-border flex items-center justify-center relative overflow-hidden">
                     {hero.primaryAttr === 'str' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-dota-dire shadow-glow"></div>}
                     {hero.primaryAttr === 'agi' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-dota-radiant shadow-glow"></div>}
                     {hero.primaryAttr === 'int' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-cyan-500 shadow-glow"></div>}
                     {hero.primaryAttr === 'all' && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-dota-gold shadow-glow"></div>}
                     <span className="text-4xl font-black text-white/10 select-none">{hero.localizedName.charAt(0)}</span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-dota-gold transition-colors">{hero.localizedName}</h3>
                      <p className="text-[10px] text-dota-muted uppercase tracking-wider mt-1 truncate">
                        {hero.roles.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <button 
                      onClick={() => onSelectHero(hero)}
                      className="mt-3 w-full border border-dota-border bg-dota-panel text-xs uppercase tracking-wider font-bold py-1.5 hover:bg-dota-gold hover:text-dota-dark hover:border-dota-gold transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
              {filteredHeroes.length === 0 && (
                <div className="col-span-full py-10 text-center text-dota-muted uppercase tracking-widest text-sm">
                  No heroes found matching your battle criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
