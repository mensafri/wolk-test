import type { DraftPlanDetailData, HeroCache } from '../types';

interface DraftSummaryModalProps {
  plan: DraftPlanDetailData;
  heroes?: HeroCache[];
  onClose: () => void;
}

export default function DraftSummaryModal({ plan, heroes, onClose }: DraftSummaryModalProps) {
  const getHeroDetails = (heroId: number) => heroes?.find(h => h.id === heroId);

  const bans = plan.heroes.filter(h => h.type === 'BAN');
  const prefers = plan.heroes.filter(h => h.type === 'PREFERRED');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">{plan.name} - Summary</h2>
          <p className="text-slate-400 mt-1">{plan.description}</p>
        </div>
        <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
          Close Summary
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-start">
        
        {/* Bans Summary */}
        <section className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-5">
          <h3 className="text-xl font-bold text-rose-400 mb-4 border-b border-rose-900/50 pb-2">Bans</h3>
          {bans.length === 0 ? <p className="text-rose-200/50 text-sm">No bans.</p> : (
            <div className="space-y-3">
              {bans.map(ban => {
                const h = getHeroDetails(ban.heroId);
                return (
                  <div key={ban.id} className="flex gap-3 items-center">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${h?.name.replace('npc_dota_hero_', '')}.png`} alt="" className="w-10 h-10 rounded shadow-sm object-cover grayscale brightness-75" />
                    <div>
                      <div className="font-bold text-rose-200 whitespace-nowrap">{h?.localizedName}</div>
                      {ban.note && <div className="text-xs text-rose-300/80 leading-tight">{ban.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Preferred Summary */}
        <section className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 border-b border-emerald-900/50 pb-2">Preferred Picks</h3>
          {prefers.length === 0 ? <p className="text-emerald-200/50 text-sm">No picks.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prefers.map(pick => {
                const h = getHeroDetails(pick.heroId);
                return (
                  <div key={pick.id} className="flex gap-3 bg-emerald-900/10 p-2 rounded-lg border border-emerald-900/30">
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${h?.name.replace('npc_dota_hero_', '')}.png`} alt="" className="w-12 h-12 rounded shadow-sm object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-emerald-200 truncate">{h?.localizedName}</div>
                        {pick.priority && <span className={`text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider ${pick.priority === 'HIGH' ? 'bg-amber-500 text-amber-950' : pick.priority === 'MEDIUM' ? 'bg-blue-500 text-blue-950' : 'bg-slate-600 text-slate-200'}`}>{pick.priority}</span>}
                      </div>
                      {pick.role && <div className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-widest mt-0.5">{pick.role}</div>}
                      {pick.note && <div className="text-xs text-emerald-300/70 truncate mt-1">{pick.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Threats & Timings Summary */}
        <div className="space-y-6">
          <section className="bg-orange-950/30 border border-orange-900/50 rounded-xl p-5">
            <h3 className="text-xl font-bold text-orange-400 mb-4 border-b border-orange-900/50 pb-2">Enemy Threats</h3>
            {plan.enemyThreats.length === 0 ? <p className="text-orange-200/50 text-sm">No threats.</p> : (
              <ul className="space-y-3">
                {plan.enemyThreats.map(threat => {
                  const h = getHeroDetails(threat.heroId);
                  return (
                    <li key={threat.id} className="flex items-start gap-2 text-sm">
                      <span className="font-bold text-orange-300 whitespace-nowrap">{h?.localizedName}:</span>
                      <span className="text-orange-200/70">{threat.note}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5">
            <h3 className="text-xl font-bold text-blue-400 mb-4 border-b border-blue-900/50 pb-2">Item Timings</h3>
            {plan.itemTimings.length === 0 ? <p className="text-blue-200/50 text-sm">No timings.</p> : (
              <ul className="space-y-2">
                {plan.itemTimings.map(t => (
                  <li key={t.id} className="bg-blue-900/20 p-2 rounded border border-blue-900/40">
                    <div className="font-mono text-blue-300 font-bold text-sm">{t.timing}</div>
                    <div className="text-xs text-blue-200/70 mt-1">{t.explanation}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
