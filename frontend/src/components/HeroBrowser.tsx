import { useQuery } from '@tanstack/react-query';
import { getHeroes } from '../api';
import type { HeroCache } from '../types';
import { useState, useMemo } from 'react';

interface HeroBrowserProps {
  onClose: () => void;
  onSelect: (hero: HeroCache) => void;
  excludingHeroIds?: number[];
}

export default function HeroBrowser({ onClose, onSelect, excludingHeroIds = [] }: HeroBrowserProps) {
  const { data: heroes, isLoading } = useQuery({ queryKey: ['heroes'], queryFn: getHeroes });
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');

  const filteredHeroes = useMemo(() => {
    if (!heroes) return [];
    return heroes.filter(h => {
      if (excludingHeroIds.includes(h.id)) return false;
      if (search && !h.localizedName.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter !== 'all' && h.primaryAttr !== attrFilter) return false;
      return true;
    }).sort((a, b) => a.localizedName.localeCompare(b.localizedName));
  }, [heroes, search, attrFilter, excludingHeroIds]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">Select a Hero</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-800/30">
          <input 
            type="text" 
            placeholder="Search heroes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
          <select 
            value={attrFilter} 
            onChange={e => setAttrFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Attributes</option>
            <option value="str">Strength</option>
            <option value="agi">Agility</option>
            <option value="int">Intelligence</option>
            <option value="all">Universal</option> 
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading heroes...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredHeroes.map(hero => (
                <button
                  key={hero.id}
                  onClick={() => onSelect(hero)}
                  className="flex flex-col items-center bg-slate-800 border border-slate-700 hover:border-emerald-500 p-3 rounded-lg hover:bg-slate-700 transition-all group"
                >
                  <div className="w-16 h-16 bg-slate-900 rounded-full mb-3 flex items-center justify-center border border-slate-700 shadow-inner overflow-hidden">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name.replace('npc_dota_hero_', '')}.png`} alt={hero.localizedName} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 text-center leading-tight">
                    {hero.localizedName}
                  </span>
                </button>
              ))}
              {filteredHeroes.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No heroes found matching criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
