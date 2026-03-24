import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDraftPlan, addListHero, removeListHero, updateListHero, addThreat, removeThreat, updateThreat, addItemTiming, removeItemTiming, getHeroes } from '../api';
import HeroBrowser from '../components/HeroBrowser';
import DraftSummaryModal from '../components/DraftSummaryModal';
import type { HeroCache } from '../types';

export default function DraftPlanDetail() {
  const { id } = useParams();
  const planId = parseInt(id!);
  const queryClient = useQueryClient();

  const [modalType, setModalType] = useState<'BAN' | 'PREFERRED' | 'THREAT' | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const { data: plan, isLoading } = useQuery({ queryKey: ['draft-plan', planId], queryFn: () => getDraftPlan(planId) });
  const { data: heroes } = useQuery({ queryKey: ['heroes'], queryFn: getHeroes });

  // Mutations
  const addHeroM = useMutation({ mutationFn: (data: any) => addListHero(planId, data), onSuccess: () => refresh() });
  const updateHeroM = useMutation({ mutationFn: ({ id, data }: { id: number, data: any }) => updateListHero(id, data), onSuccess: () => refresh() });
  const removeHeroM = useMutation({ mutationFn: removeListHero, onSuccess: () => refresh() });

  const addThreatM = useMutation({ mutationFn: (data: any) => addThreat(planId, data), onSuccess: () => refresh() });
  const updateThreatM = useMutation({ mutationFn: ({ id, data }: { id: number, data: any }) => updateThreat(id, data), onSuccess: () => refresh() });
  const removeThreatM = useMutation({ mutationFn: removeThreat, onSuccess: () => refresh() });

  const addItemTimingM = useMutation({ mutationFn: (data: any) => addItemTiming(planId, data), onSuccess: () => refresh() });
  const removeItemTimingM = useMutation({ mutationFn: removeItemTiming, onSuccess: () => refresh() });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['draft-plan', planId] });

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading plan details...</div>;
  if (!plan) return <div className="text-center py-12 text-red-400">Plan not found.</div>;

  const handleHeroSelect = (hero: HeroCache) => {
    if (modalType === 'BAN' || modalType === 'PREFERRED') {
      addHeroM.mutate({ heroId: hero.id, type: modalType });
    } else if (modalType === 'THREAT') {
      addThreatM.mutate({ heroId: hero.id, note: '' });
    }
    setModalType(null);
  };

  const getHeroDetails = (heroId: number) => heroes?.find(h => h.id === heroId);

  const usedHeroIds = [
    ...(plan.heroes.map(h => h.heroId)),
    ...(plan.enemyThreats.map(t => t.heroId))
  ];

  const bans = plan.heroes.filter(h => h.type === 'BAN');
  const prefers = plan.heroes.filter(h => h.type === 'PREFERRED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex justify-between items-start">
        <div>
          <Link to="/" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium mb-3 inline-block">← Back to Plans</Link>
          <h1 className="text-3xl font-bold text-white mb-2">{plan.name}</h1>
          <p className="text-slate-400">{plan.description}</p>
        </div>
        <button 
          onClick={() => setShowSummary(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
        >
          View Summary
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Ban List */}
          <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-rose-400">Ban List</h2>
              <button onClick={() => setModalType('BAN')} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md transition-colors">
                + Add Ban
              </button>
            </div>
            <div className="space-y-3">
              {bans.length === 0 && <p className="text-slate-500 text-sm italic">No bans configured.</p>}
              {bans.map(ban => {
                const hero = getHeroDetails(ban.heroId);
                return (
                  <div key={ban.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-start gap-4">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero?.name.replace('npc_dota_hero_', '')}.png`} alt="" className="w-12 h-12 rounded bg-slate-800 object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-white">{hero?.localizedName}</h3>
                        <button onClick={() => removeHeroM.mutate(ban.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-sm">Remove</button>
                      </div>
                      <input 
                        type="text"
                        placeholder="Add a note..."
                        value={ban.note || ''}
                        onChange={e => updateHeroM.mutate({ id: ban.id, data: { note: e.target.value }})}
                        className="mt-2 w-full bg-slate-800 border-none rounded px-3 py-1 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Preferred Picks */}
          <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-400">Preferred Picks</h2>
              <button onClick={() => setModalType('PREFERRED')} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md transition-colors">
                + Add Pick
              </button>
            </div>
            <div className="space-y-3">
              {prefers.length === 0 && <p className="text-slate-500 text-sm italic">No preferred picks configured.</p>}
              {prefers.map(pick => {
                const hero = getHeroDetails(pick.heroId);
                return (
                  <div key={pick.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-start gap-4">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero?.name.replace('npc_dota_hero_', '')}.png`} alt="" className="w-12 h-12 rounded bg-slate-800 object-cover" />
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between">
                        <h3 className="font-bold text-white">{hero?.localizedName}</h3>
                        <button onClick={() => removeHeroM.mutate(pick.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-sm">Remove</button>
                      </div>
                      <div className="flex gap-2">
                         <select value={pick.role || ''} onChange={e => updateHeroM.mutate({ id: pick.id, data: { role: e.target.value }})} className="bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-300">
                           <option value="">Role (Any)</option>
                           <option value="Carry">Carry</option><option value="Mid">Mid</option><option value="Offlane">Offlane</option><option value="Soft Support">Soft Supp</option><option value="Hard Support">Hard Supp</option>
                         </select>
                         <select value={pick.priority || ''} onChange={e => updateHeroM.mutate({ id: pick.id, data: { priority: e.target.value }})} className="bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-300">
                           <option value="">Priority</option>
                           <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                         </select>
                      </div>
                      <input 
                        type="text"
                        placeholder="Add a note..."
                        value={pick.note || ''}
                        onChange={e => updateHeroM.mutate({ id: pick.id, data: { note: e.target.value }})}
                        className="w-full bg-slate-800 border-none rounded px-3 py-1 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           {/* Enemy Threats */}
           <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 border-t-4 border-t-orange-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-orange-400">Enemy Threats</h2>
              <button onClick={() => setModalType('THREAT')} className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md transition-colors">
                + Add Threat
              </button>
            </div>
            <div className="space-y-3">
              {plan.enemyThreats.length === 0 && <p className="text-slate-500 text-sm italic">No enemy threats documented.</p>}
              {plan.enemyThreats.map(threat => {
                const hero = getHeroDetails(threat.heroId);
                return (
                  <div key={threat.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex items-start gap-4">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero?.name.replace('npc_dota_hero_', '')}.png`} alt="" className="w-10 h-10 rounded bg-slate-800 object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-white text-sm">{hero?.localizedName}</h3>
                        <button onClick={() => removeThreatM.mutate(threat.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-xs">Remove</button>
                      </div>
                      <textarea 
                        rows={2}
                        placeholder="Why is it a threat?"
                        value={threat.note || ''}
                        onChange={e => updateThreatM.mutate({ id: threat.id, data: { note: e.target.value }})}
                        className="mt-2 w-full bg-slate-800 border-none rounded px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Item Timings */}
          <section className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 border-t-4 border-t-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-400">Item Timings</h2>
            </div>
            <div className="space-y-3">
              {plan.itemTimings.length === 0 && <p className="text-slate-500 text-sm italic">No item timings added.</p>}
              {plan.itemTimings.map(timing => (
                <div key={timing.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center gap-4">
                  <div>
                    <span className="font-mono text-blue-300 text-sm bg-blue-900/30 px-2 py-0.5 rounded">{timing.timing}</span>
                    <p className="text-slate-400 text-xs mt-1">{timing.explanation}</p>
                  </div>
                  <button onClick={() => removeItemTimingM.mutate(timing.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-xs">Remove</button>
                </div>
              ))}
              
              <form onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const timing = fd.get('timing') as string;
                const explanation = fd.get('explanation') as string;
                if(timing && explanation) {
                  addItemTimingM.mutate({ timing, explanation });
                  e.currentTarget.reset();
                }
              }} className="bg-slate-900 border border-slate-700 p-3 rounded-lg mt-4">
                <div className="space-y-2">
                  <input name="timing" required placeholder="e.g. BKB ~18 min" className="w-full bg-slate-800 rounded px-3 py-1.5 text-sm text-white border-none" />
                  <input name="explanation" required placeholder="Explanation" className="w-full bg-slate-800 rounded px-3 py-1.5 text-sm text-white border-none" />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded transition-colors">+ Add Timing</button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {modalType && (
        <HeroBrowser 
          onClose={() => setModalType(null)} 
          onSelect={handleHeroSelect}
          excludingHeroIds={usedHeroIds}
        />
      )}

      {showSummary && (
        <DraftSummaryModal 
          plan={plan}
          heroes={heroes}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
