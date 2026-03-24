import type { DraftPlanDetailData, HeroCache } from '../types';

interface DraftSummaryModalProps {
  plan: DraftPlanDetailData;
  heroesCache: HeroCache[];
  onClose: () => void;
}

export default function DraftSummaryModal({ plan, heroesCache, onClose }: DraftSummaryModalProps) {
  const getHeroDetail = (id: number) => heroesCache.find(h => h.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dota-panel border border-dota-gold/50 rounded-sm shadow-dota w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-dota-dark via-dota-panel to-dota-dark p-6 border-b border-dota-border sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-dota-gold">Draft Summary: {plan.name}</h2>
            {plan.description && <p className="text-dota-text text-sm mt-1">{plan.description}</p>}
          </div>
          <button onClick={onClose} className="dota-btn dota-btn-secondary border-none hover:bg-dota-dire">
            Close ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Automated Synergy Note */}
          {plan.synergyNote && (
            <div className="bg-gradient-to-r from-dota-dark to-transparent border-l-4 border-dota-radiant p-4">
              <h4 className="text-xs font-bold text-dota-radiant uppercase tracking-widest mb-1">Analyzer AI Synergy</h4>
              <p className="text-sm font-mono text-dota-text">{plan.synergyNote}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bans */}
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest text-dota-dire border-b border-dota-dire/30 mb-4 pb-2">Banned Heroes ({plan.heroes.filter(h => h.type === 'BAN').length})</h3>
              <ul className="space-y-3">
                {plan.heroes.filter(h => h.type === 'BAN').map(h => {
                  const heroDetail = getHeroDetail(h.heroId);
                  return (
                    <li key={h.id} className="bg-dota-dark p-3 border border-dota-border rounded-sm flex items-start gap-3">
                       <div className="w-10 h-10 bg-dota-panel border border-dota-dire flex items-center justify-center font-bold text-dota-dire shrink-0">
                         {heroDetail?.localizedName?.charAt(0) || '?'}
                       </div>
                       <div>
                         <div className="font-bold text-white">{heroDetail?.localizedName || 'Unknown Hero'}</div>
                         {h.note && <div className="text-xs text-dota-muted italic mt-1">"{h.note}"</div>}
                       </div>
                    </li>
                  )
                })}
                {plan.heroes.filter(h => h.type === 'BAN').length === 0 && <span className="text-sm text-dota-muted italic">No bans registered.</span>}
              </ul>
            </div>

            {/* Preferred Picks */}
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest text-dota-radiant border-b border-dota-radiant/30 mb-4 pb-2">Preferred Picks ({plan.heroes.filter(h => h.type === 'PREFERRED').length})</h3>
              <ul className="space-y-3">
                {plan.heroes.filter(h => h.type === 'PREFERRED').map(h => {
                  const heroDetail = getHeroDetail(h.heroId);
                  return (
                    <li key={h.id} className="bg-dota-dark p-3 border border-dota-border rounded-sm flex items-start gap-3">
                       <div className="w-10 h-10 bg-dota-panel border border-dota-radiant flex items-center justify-center font-bold text-dota-radiant shrink-0">
                         {heroDetail?.localizedName?.charAt(0) || '?'}
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between">
                            <span className="font-bold text-white">{heroDetail?.localizedName || 'Unknown Hero'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider ${h.priority === 'HIGH' ? 'bg-dota-radiant/20 text-dota-radiant' : h.priority === 'MEDIUM' ? 'bg-dota-gold/20 text-dota-gold' : 'bg-slate-700 text-slate-300'}`}>
                              {h.priority}
                            </span>
                         </div>
                         <div className="text-xs text-dota-gold font-bold mt-1">Role: <span className="text-dota-text font-normal">{h.role || 'Any'}</span></div>
                         {h.note && <div className="text-xs text-dota-muted italic mt-1">"{h.note}"</div>}
                       </div>
                    </li>
                  )
                })}
                {plan.heroes.filter(h => h.type === 'PREFERRED').length === 0 && <span className="text-sm text-dota-muted italic">No picks registered.</span>}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dota-border pt-8">
            {/* Enemy Threats */}
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest text-orange-400 border-b border-orange-400/30 mb-4 pb-2">Enemy Threats</h3>
              <ul className="space-y-3">
                {plan.enemyThreats.map(t => {
                  const heroDetail = getHeroDetail(t.heroId);
                  return (
                    <li key={t.id} className="bg-dota-dark p-3 border border-dota-border rounded-sm">
                      <div className="font-bold text-orange-300 mb-1">!! {heroDetail?.localizedName || 'Unknown Hero'}</div>
                      {t.note && <div className="text-xs text-dota-muted">{t.note}</div>}
                    </li>
                  )
                })}
                {plan.enemyThreats.length === 0 && <span className="text-sm text-dota-muted italic">No threats analyzed.</span>}
              </ul>
            </div>

            {/* Item Timings */}
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest text-cyan-400 border-b border-cyan-400/30 mb-4 pb-2">Key Item Timings</h3>
              <ul className="space-y-3">
                {plan.itemTimings.map(it => (
                  <li key={it.id} className="bg-dota-dark p-3 border border-dota-border border-l-2 border-l-cyan-500 rounded-sm">
                    <div className="font-bold font-mono text-cyan-300 text-sm mb-1">⏱ {it.timing}</div>
                    <div className="text-xs text-dota-text">{it.explanation}</div>
                  </li>
                ))}
                {plan.itemTimings.length === 0 && <span className="text-sm text-dota-muted italic">No item timings specified.</span>}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
