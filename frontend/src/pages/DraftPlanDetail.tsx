import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDraftPlan, addListHero, updateListHero, removeListHero, getHeroes } from '../api';
import HeroBrowser from '../components/HeroBrowser';

export default function DraftPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [heroesDict, setHeroesDict] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'BANS' | 'PICKS' | 'THREATS' | 'TIMINGS' | 'SUMMARY'>('BANS');
  
  const [browserMode, setBrowserMode] = useState<'BAN' | 'PICK' | null>(null);

  useEffect(() => {
    fetchPlanData();
    getHeroes().then(data => {
      const dict: Record<number, string> = {};
      data.forEach(h => dict[h.id] = h.localizedName);
      setHeroesDict(dict);
    }).catch(console.error);
  }, [id]);

  const fetchPlanData = async () => {
    try {
      const data = await getDraftPlan(Number(id));
      setPlan(data);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  const handleHeroSelect = async (heroId: number, name: string) => {
    if (browserMode === 'BAN') {
      await addListHero(Number(id), { heroId, heroName: name, type: 'BAN' });
    } else {
      await addListHero(Number(id), { heroId, heroName: name, type: 'PREFERRED', role: 'Flex', priority: 'MEDIUM' });
    }
    setBrowserMode(null);
    fetchPlanData();
  };

  const handleUpdateBan = async (banId: number, note: string) => {
    await updateListHero(banId, { note });
    fetchPlanData();
  };

  const handleDeleteBan = async (banId: number) => {
    await removeListHero(banId);
    fetchPlanData();
  };

  const handleUpdatePick = async (pickId: number, updates: any) => {
    await updateListHero(pickId, updates);
    fetchPlanData();
  };

  const handleDeletePick = async (pickId: number) => {
    await removeListHero(pickId);
    fetchPlanData();
  };

  // Helper arrays
  const bans = plan?.heroes?.filter((h: any) => h.type === 'BAN') || [];
  const picks = plan?.heroes?.filter((h: any) => h.type === 'PREFERRED') || [];
  const threats = plan?.enemyThreats || [];
  const timings = plan?.itemTimings || [];

  if (!plan) return <div className="text-center py-20 text-tactical-text-secondary">Loading operation data...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
      {/* PAGE HEADER */}
      <div className="card p-6 border-l-4 border-l-tactical-primary">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-tactical-text-primary tracking-tight leading-tight">{plan.name}</h1>
            <p className="text-[16px] text-tactical-text-secondary mt-1">{plan.description || 'No description provided'}</p>
          </div>
          <button onClick={() => navigate('/')} className="btn btn-secondary shrink-0">
            Back to Plans
          </button>
        </div>
      </div>

      {/* TABS SEGMENTED CONTROL */}
      <div className="flex bg-tactical-surface-dark border p-1 border-tactical-border rounded-lg shadow-subtle overflow-x-auto w-fit">
        {[
          { id: 'BANS', label: `Ban List (${bans.length})` },
          { id: 'PICKS', label: `Preferred Picks (${picks.length})` },
          { id: 'THREATS', label: `Enemy Threats (${threats.length})` },
          { id: 'TIMINGS', label: `Key Timings (${timings.length})` },
          { id: 'SUMMARY', label: 'Draft Summary' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-[14px] font-medium rounded-md whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-tactical-primary text-white shadow-subtle' 
                : 'text-tactical-text-secondary hover:text-tactical-text-primary hover:bg-tactical-surface'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="flex flex-col gap-6">
        
        {/* BAN LIST TAB */}
        {activeTab === 'BANS' && (
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-tactical-border pb-4">
              <h2 className="text-[20px] font-bold text-tactical-text-primary">Target Bans</h2>
              <button className="btn btn-danger" onClick={() => setBrowserMode('BAN')}>Add Ban</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bans.length === 0 && <p className="text-tactical-text-secondary text-[14px] col-span-full">No bans registered.</p>}
              {bans.map((b: any) => {
                const heroName = heroesDict[b.heroId] || 'Unknown Hero';
                return (
                <div key={b.id} className="flex bg-tactical-surface-dark border border-tactical-border rounded-sm overflow-hidden h-24 shadow-subtle">
                  <div className="w-24 shrink-0 bg-tactical-bg flex items-center justify-center border-r border-tactical-border relative overflow-hidden">
                    {/* Placeholder for avatar mapping */}
                    <div className="absolute inset-0 opacity-20 bg-tactical-error"></div>
                    <span className="text-[12px] font-bold z-10 text-center break-words px-1">{heroName}</span>
                  </div>
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start gap-2">
                       <h3 className="font-bold text-[16px] text-tactical-text-primary leading-none">{heroName}</h3>
                       <button onClick={() => handleDeleteBan(b.id)} className="text-[12px] text-tactical-text-secondary hover:text-tactical-error uppercase tracking-wider font-bold">Remove</button>
                    </div>
                    <input 
                      type="text" 
                      value={b.note || ''} 
                      onChange={e => handleUpdateBan(b.id, e.target.value)}
                      placeholder="Reason for ban..."
                      className="text-[12px] bg-transparent border-b border-tactical-border text-tactical-text-primary placeholder:text-tactical-text-secondary focus:outline-none focus:border-tactical-primary pb-1 w-full mt-auto"
                    />
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* PREFERRED PICKS TAB */}
        {activeTab === 'PICKS' && (
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-tactical-border pb-4">
              <h2 className="text-[20px] font-bold text-tactical-text-primary">Preferred Picks</h2>
              <button className="btn btn-primary" onClick={() => setBrowserMode('PICK')}>Add Pick</button>
            </div>
            
            <div className="flex flex-col gap-4">
              {picks.length === 0 && <p className="text-tactical-text-secondary text-[14px]">No picks registered.</p>}
              {picks.map((p: any) => {
                const heroName = heroesDict[p.heroId] || 'Unknown Hero';
                return (
                <div key={p.id} className="flex flex-col sm:flex-row bg-tactical-surface-dark border border-tactical-border rounded-sm shadow-subtle overflow-hidden">
                  <div className="w-full sm:w-32 shrink-0 bg-tactical-bg border-b sm:border-b-0 sm:border-r border-tactical-border flex items-center justify-center py-4 relative overflow-hidden">
                     <div className="absolute inset-0 opacity-20 bg-tactical-success"></div>
                     <span className="font-bold z-10 text-center">{heroName}</span>
                  </div>
                  <div className="p-4 flex flex-1 flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Role</label>
                      <select 
                        className="input-field h-8 text-[14px] bg-tactical-surface"
                        value={p.role} 
                        onChange={e => handleUpdatePick(p.id, { role: e.target.value })}
                      >
                        <option>Carry</option><option>Mid</option><option>Offlane</option><option>Support</option><option>Hard Support</option><option>Flex</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Priority</label>
                      <select 
                        className={`input-field h-8 text-[14px] font-bold ${p.priority === 'High' ? 'text-tactical-primary bg-tactical-primary/10 border-tactical-primary' : p.priority === 'Medium' ? 'text-tactical-secondary bg-tactical-secondary/10' : 'text-tactical-text-secondary'}`}
                        value={p.priority} 
                        onChange={e => handleUpdatePick(p.id, { priority: e.target.value })}
                      >
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                      <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Tactical Notes</label>
                      <input 
                        type="text" 
                        className="input-field h-8 text-[14px]"
                        placeholder="Synergy or draft condition..."
                        value={p.note || ''} 
                        onChange={e => handleUpdatePick(p.id, { note: e.target.value })}
                      />
                    </div>
                    <button onClick={() => handleDeletePick(p.id)} className="btn hover:bg-tactical-error hover:text-white border border-transparent text-tactical-text-secondary h-8 px-3 ml-auto shrink-0">
                      Remove
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* THREATS & TIMINGS */}
        {(activeTab === 'THREATS' || activeTab === 'TIMINGS') && (
           <div className="card p-12 flex flex-col items-center justify-center text-center border-dashed border-tactical-border bg-transparent shadow-none">
             <p className="text-[16px] text-tactical-text-secondary mb-2">Extended Tactical Modules (API Incomplete)</p>
             <p className="text-[14px] text-tactical-text-secondary opacity-70">Enemies and Timings modules are designated for future firmware updates.</p>
           </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'SUMMARY' && (
          <div className="card p-6 flex flex-col gap-8 bg-tactical-surface-dark">
            <div className="flex flex-col gap-2">
               <h2 className="text-[24px] font-bold text-tactical-text-primary tracking-tight">Draft Strategy Summary</h2>
               <p className="text-[14px] text-tactical-text-secondary tracking-wide uppercase">Operational Overview — {plan.name}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-error uppercase tracking-wider border-b border-tactical-border pb-2">Target Bans</h3>
                {bans.length === 0 ? <p className="text-[12px] text-tactical-text-secondary">No bans assigned.</p> : (
                  <ul className="flex flex-col gap-2">
                    {bans.map((b: any) => {
                      const heroName = heroesDict[b.heroId] || 'Unknown Hero';
                      return (
                      <li key={b.id} className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-[14px]">{heroName}</span>
                        <span className="text-[12px] text-tactical-text-secondary italic border-b border-tactical-border border-dotted flex-1 text-right">{b.note || 'No notes'}</span>
                      </li>
                    )})}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-success uppercase tracking-wider border-b border-tactical-border pb-2">Priority Picks</h3>
                {picks.length === 0 ? <p className="text-[12px] text-tactical-text-secondary">No picks assigned.</p> : (
                  <ul className="flex flex-col gap-3">
                    {picks.map((p: any) => {
                      const heroName = heroesDict[p.heroId] || 'Unknown Hero';
                      return (
                      <li key={p.id} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="font-bold text-[14px]">{heroName} <span className="text-[12px] font-normal text-tactical-text-secondary ml-1">— {p.role}</span></span>
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${p.priority === 'High' ? 'bg-tactical-primary text-white' : p.priority === 'Medium' ? 'bg-tactical-secondary text-white' : 'bg-tactical-border text-tactical-text-secondary'}`}>
                             {p.priority}
                           </span>
                        </div>
                        {p.note && <span className="text-[12px] text-tactical-text-secondary italic">{p.note}</span>}
                      </li>
                    )})}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {browserMode && (
        <HeroBrowser 
          mode={browserMode} 
          onClose={() => setBrowserMode(null)} 
          onSelect={handleHeroSelect} 
        />
      )}
    </div>
  );
}
