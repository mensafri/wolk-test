import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getDraftPlan, getHeroes, addListHero, updateListHero, removeListHero, addThreat, removeThreat, updateThreat, addItemTiming, removeItemTiming } from '../api';
import { useState } from 'react';
import HeroBrowser from '../components/HeroBrowser';
import DraftSummaryModal from '../components/DraftSummaryModal';
import type { HeroCache } from '../types';

export default function DraftPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id!);
  const queryClient = useQueryClient();

  const [showSummary, setShowSummary] = useState(false);
  
  // Hero Browser Modal State
  const [browserMode, setBrowserMode] = useState<'NONE' | 'BAN' | 'PREFERRED' | 'THREAT'>('NONE');

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['draftPlan', planId],
    queryFn: () => getDraftPlan(planId),
    refetchInterval: 5000 // Polling every 5s to get synergyNote updates from the background worker
  });

  const { data: heroesCache } = useQuery({
    queryKey: ['heroes'],
    queryFn: getHeroes,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const invalidatePlan = () => {
    queryClient.invalidateQueries({ queryKey: ['draftPlan', planId] });
  };

  const addHeroMut = useMutation({ mutationFn: (data: any) => addListHero(planId, data), onSuccess: invalidatePlan });
  const updateHeroMut = useMutation({ mutationFn: (data: any) => updateListHero(data.id, data), onSuccess: invalidatePlan });
  const removeHeroMut = useMutation({ mutationFn: removeListHero, onSuccess: invalidatePlan });

  const addThreatMut = useMutation({ mutationFn: (data: any) => addThreat(planId, data), onSuccess: invalidatePlan });
  const updateThreatMut = useMutation({ mutationFn: (data: any) => updateThreat(data.id, data), onSuccess: invalidatePlan });
  const removeThreatMut = useMutation({ mutationFn: removeThreat, onSuccess: invalidatePlan });

  const addTimingMut = useMutation({ mutationFn: (data: any) => addItemTiming(planId, data), onSuccess: invalidatePlan });
  const removeTimingMut = useMutation({ mutationFn: removeItemTiming, onSuccess: invalidatePlan });

  const handleSelectHero = (hero: HeroCache) => {
    if (browserMode === 'BAN') {
      addHeroMut.mutate({ heroId: hero.id, type: 'BAN', note: '' });
    } else if (browserMode === 'PREFERRED') {
      addHeroMut.mutate({ heroId: hero.id, type: 'PREFERRED', role: 'Support', priority: 'MEDIUM', note: '' });
    } else if (browserMode === 'THREAT') {
      addThreatMut.mutate({ heroId: hero.id, note: '' });
    }
    setBrowserMode('NONE');
  };

  // Generic helper for getting hero details
  const getHeroDetail = (heroId: number) => heroesCache?.find(h => h.id === heroId);

  if (planLoading) return <div className="text-center py-20 text-dota-gold uppercase tracking-widest animate-pulse">Loading Battle Plan...</div>;
  if (!plan) return <div className="text-center py-20 text-dota-dire uppercase tracking-widest">Plan Not Found</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in relative pb-20">
      
      {/* Header Row */}
      <div className="bg-gradient-to-r from-dota-dark to-dota-panel p-6 border-l-4 border-l-dota-gold flex flex-col md:flex-row justify-between items-start md:items-center shadow-dota">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-dota-muted hover:text-white uppercase tracking-wider text-sm transition-colors font-bold">← Dashboard</Link>
          </div>
          <h1 className="text-3xl font-black mt-2 text-white uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{plan.name}</h1>
          {plan.description && <p className="text-dota-text font-serif italic mt-1 border-l-2 border-dota-border pl-3">{plan.description}</p>}
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setShowSummary(true)} 
            className="dota-btn dota-btn-primary animate-pulse shadow-glow"
          >
            Review Strategy (Summary)
          </button>
        </div>
      </div>

      {plan.synergyNote && (
        <div className="bg-dota-dark border border-dota-border p-4 flex gap-4 items-center">
          <div className="w-10 h-10 bg-dota-panel rounded-full border border-dota-radiant flex items-center justify-center shrink-0 shadow-glow">
            <span className="text-dota-radiant font-black">AI</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-dota-radiant font-bold block mb-1">Analyzer Worker Result</span>
            <span className="text-sm font-mono text-dota-text">{plan.synergyNote}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Bans | Preferred */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ban List */}
        <section className="dota-panel">
          <div className="p-4 border-b border-dota-dire/30 bg-gradient-to-r from-[#2c1313] to-transparent flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-dota-dire drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Ban List</h2>
            <button onClick={() => setBrowserMode('BAN')} className="dota-btn dota-btn-dire py-1 px-3 text-xs">+ Ban Hero</button>
          </div>
          <div className="p-4 space-y-4">
            {plan.heroes.filter(h => h.type === 'BAN').map(h => {
              const hero = getHeroDetail(h.heroId);
              return (
                <div key={h.id} className="bg-dota-dark p-3 border border-dota-border/50 hover:border-dota-dire/50 transition-colors flex gap-4 group">
                  <div className="w-12 h-12 bg-dota-panel border border-dota-border flex justify-center items-center text-dota-dire font-black text-xl shrink-0">
                    {hero?.localizedName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-white uppercase tracking-wider">{hero?.localizedName}</span>
                       <button onClick={() => removeHeroMut.mutate(h.id)} className="text-dota-muted hover:text-dota-dire font-bold text-xs">Remove</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Add a reason to ban..."
                      className="dota-input py-1 text-sm bg-dota-panel border-none font-serif italic w-full"
                      value={h.note || ''}
                      onChange={e => updateHeroMut.mutate({ id: h.id, note: e.target.value })}
                      onBlur={() => updateHeroMut.mutate({ id: h.id, note: h.note })}
                    />
                  </div>
                </div>
              );
            })}
            {plan.heroes.filter(h => h.type === 'BAN').length === 0 && (
              <div className="p-6 text-center text-dota-muted uppercase tracking-wider text-xs border border-dashed border-dota-border">
                No heroes assigned to the ban list
              </div>
            )}
          </div>
        </section>

        {/* Preferred Picks */}
        <section className="dota-panel">
          <div className="p-4 border-b border-dota-radiant/30 bg-gradient-to-r from-[#172c13] to-transparent flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-dota-radiant drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">Preferred Picks</h2>
            <button onClick={() => setBrowserMode('PREFERRED')} className="dota-btn dota-btn-radiant py-1 px-3 text-xs">+ Pick Hero</button>
          </div>
          <div className="p-4 space-y-4">
            {plan.heroes.filter(h => h.type === 'PREFERRED').map(h => {
              const hero = getHeroDetail(h.heroId);
              return (
                <div key={h.id} className="bg-dota-dark p-3 border border-dota-border/50 hover:border-dota-radiant/50 transition-colors flex gap-4 group">
                  <div className="w-12 h-12 bg-dota-panel border border-dota-border flex justify-center items-center text-dota-radiant font-black text-xl shrink-0">
                    {hero?.localizedName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="font-bold text-white uppercase tracking-wider">{hero?.localizedName}</span>
                       <button onClick={() => removeHeroMut.mutate(h.id)} className="text-dota-muted hover:text-dota-dire font-bold text-xs">Remove</button>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={h.role || 'Any'} 
                        onChange={e => updateHeroMut.mutate({ id: h.id, role: e.target.value, priority: h.priority, note: h.note })}
                        className="bg-dota-panel border border-dota-border rounded-sm text-xs text-white p-1 outline-none"
                      >
                        <option>Carry</option><option>Mid</option><option>Offlane</option><option>Support</option><option>Hard Support</option><option>Any</option>
                      </select>
                      <select 
                        value={h.priority || 'MEDIUM'} 
                        onChange={e => updateHeroMut.mutate({ id: h.id, role: h.role, priority: e.target.value, note: h.note })}
                        className={`bg-dota-panel border rounded-sm text-xs p-1 outline-none font-bold ${h.priority === 'HIGH' ? 'border-dota-radiant text-dota-radiant' : h.priority === 'LOW' ? 'border-dota-muted text-dota-muted' : 'border-dota-gold text-dota-gold'}`}
                      >
                        <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
                      </select>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Pick condition/synergy note..."
                      className="dota-input py-1 text-sm bg-dota-panel border-none font-serif italic w-full"
                      value={h.note || ''}
                      onChange={e => updateHeroMut.mutate({ id: h.id, role: h.role, priority: h.priority, note: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}
            {plan.heroes.filter(h => h.type === 'PREFERRED').length === 0 && (
              <div className="p-6 text-center text-dota-muted uppercase tracking-wider text-xs border border-dashed border-dota-border">
                No heroes assigned to the preferred picks
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Grid: Enemy Threats | Item Timings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enemy Threats */}
        <section className="dota-panel">
          <div className="p-4 border-b border-orange-500/30 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-orange-400">Enemy Threats</h2>
            <button onClick={() => setBrowserMode('THREAT')} className="dota-btn dota-btn-secondary py-1 px-3 text-xs border-orange-500/50 hover:bg-orange-500 hover:text-white hover:border-orange-500">+ Add Threat</button>
          </div>
          <div className="p-4 space-y-4">
             {plan.enemyThreats.map(t => {
               const hero = getHeroDetail(t.heroId);
               return (
                 <div key={t.id} className="bg-dota-dark p-3 border border-orange-900/50 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-orange-300 uppercase tracking-wider">{hero?.localizedName || 'Unknown'}</span>
                      <button onClick={() => removeThreatMut.mutate(t.id)} className="text-dota-muted hover:text-dota-dire text-xs font-bold">Remove</button>
                    </div>
                    <input 
                      type="text"
                      placeholder="Why is this hero a threat?"
                      className="dota-input py-1 text-sm bg-dota-panel border-none font-serif w-full"
                      value={t.note || ''}
                      onChange={e => updateThreatMut.mutate({ id: t.id, note: e.target.value })}
                    />
                 </div>
               );
             })}
             {plan.enemyThreats.length === 0 && <div className="text-xs uppercase tracking-widest text-dota-muted text-center py-6">No threats listed</div>}
          </div>
        </section>

        {/* Item Timings */}
        <section className="dota-panel">
          <div className="p-4 border-b border-cyan-500/30">
            <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400">Key Timings</h2>
          </div>
          <div className="p-4 space-y-4">
             {plan.itemTimings.map(it => (
                <div key={it.id} className="bg-dota-dark p-3 border-l-2 border-cyan-600 flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-bold font-mono text-cyan-300 text-sm mb-1">{it.timing}</div>
                    <div className="text-sm text-dota-text">{it.explanation}</div>
                  </div>
                  <button onClick={() => removeTimingMut.mutate(it.id)} className="text-dota-muted hover:text-dota-dire text-xs font-bold shrink-0">Remove</button>
                </div>
             ))}
             
             {/* Add Timing Form Inline */}
             <form onSubmit={e => {
               e.preventDefault();
               const target = e.target as any;
               addTimingMut.mutate({ timing: target.timing.value, explanation: target.exp.value });
               target.reset();
             }} className="border border-dota-border bg-dota-dark p-3 mt-4 space-y-3">
                <input name="timing" required placeholder="Timing Marker (e.g. BKB ~18 min)" className="dota-input text-sm py-1.5" />
                <input name="exp" required placeholder="Explanation (e.g. Protects carry from magical burst)" className="dota-input text-sm py-1.5" />
                <button type="submit" className="dota-btn dota-btn-secondary text-xs w-full py-1.5">Record Timing</button>
             </form>
          </div>
        </section>
      </div>

      {/* Modals */}
      {browserMode !== 'NONE' && (
        <HeroBrowser 
          title={browserMode === 'PREFERRED' ? 'Select Preferred Pick' : browserMode === 'THREAT' ? 'Identify Enemy Threat' : 'Declare Ban'}
          onClose={() => setBrowserMode('NONE')}
          onSelectHero={handleSelectHero}
          // Don't hide heroes here since they might want to ban an already preferred hero (to swap), but standard practice is to hide what's already in the same list.
          hideHeroes={
            browserMode === 'THREAT' ? plan.enemyThreats.map(t => t.heroId) : 
            plan.heroes.filter(h => h.type === browserMode).map(h => h.heroId)
          }
        />
      )}

      {showSummary && (
        <DraftSummaryModal 
          plan={plan} 
          heroesCache={heroesCache || []} 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </div>
  );
}
