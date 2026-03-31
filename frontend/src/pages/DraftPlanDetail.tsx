import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addItemTiming,
  addListHero,
  addThreat,
  getDraftPlan,
  getHeroes,
  removeItemTiming,
  removeListHero,
  removeThreat,
  updateItemTiming,
  updateListHero,
  updateThreat,
} from '../api';
import HeroBrowser from '../components/HeroBrowser';
import HeroPortrait from '../components/HeroPortrait';
import type { DraftPlanDetailData, HeroCache, ItemTiming, ListHero } from '../types';

type ActiveTab = 'BANS' | 'PICKS' | 'THREATS' | 'TIMINGS' | 'SUMMARY';
type BrowserMode = 'BAN' | 'PICK' | 'THREAT' | null;

const priorityStyles: Record<string, string> = {
  HIGH: 'bg-tactical-primary text-white',
  MEDIUM: 'bg-tactical-secondary text-white',
  LOW: 'bg-tactical-border text-tactical-text-secondary',
};

function formatPriority(priority?: string | null) {
  if (!priority) return 'Unset';
  return `${priority.charAt(0)}${priority.slice(1).toLowerCase()}`;
}

function prioritySelectClass(priority?: string | null) {
  switch (priority) {
    case 'HIGH':
      return 'text-tactical-primary bg-tactical-primary/10 border-tactical-primary';
    case 'MEDIUM':
      return 'text-tactical-secondary bg-tactical-secondary/10 border-tactical-secondary';
    default:
      return 'text-tactical-text-secondary';
  }
}

export default function DraftPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const planId = Number(id);

  const [activeTab, setActiveTab] = useState<ActiveTab>('BANS');
  const [browserMode, setBrowserMode] = useState<BrowserMode>(null);
  const [newTiming, setNewTiming] = useState('');
  const [newTimingExplanation, setNewTimingExplanation] = useState('');

  const invalidateDraftQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['draft-plan', planId] }),
      queryClient.invalidateQueries({ queryKey: ['draft-plans'] }),
    ]);
  };

  const planQuery = useQuery({
    queryKey: ['draft-plan', planId],
    queryFn: () => getDraftPlan(planId),
    enabled: Number.isFinite(planId) && planId > 0,
    retry: false,
  });

  const heroesQuery = useQuery({
    queryKey: ['heroes'],
    queryFn: getHeroes,
  });

  const addListHeroMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addListHero>[1]) => addListHero(planId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const updateListHeroMutation = useMutation({
    mutationFn: ({ heroEntryId, payload }: { heroEntryId: number; payload: Partial<ListHero> }) => updateListHero(heroEntryId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const removeListHeroMutation = useMutation({
    mutationFn: removeListHero,
    onSuccess: invalidateDraftQueries,
  });

  const addThreatMutation = useMutation({
    mutationFn: (payload: { heroId: number; note?: string }) => addThreat(planId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const updateThreatMutation = useMutation({
    mutationFn: ({ threatId, payload }: { threatId: number; payload: { note?: string } }) => updateThreat(threatId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const removeThreatMutation = useMutation({
    mutationFn: removeThreat,
    onSuccess: invalidateDraftQueries,
  });

  const addTimingMutation = useMutation({
    mutationFn: (payload: { timing: string; explanation: string }) => addItemTiming(planId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const updateTimingMutation = useMutation({
    mutationFn: ({ timingId, payload }: { timingId: number; payload: { timing: string; explanation: string } }) => updateItemTiming(timingId, payload),
    onSuccess: invalidateDraftQueries,
  });

  const removeTimingMutation = useMutation({
    mutationFn: removeItemTiming,
    onSuccess: invalidateDraftQueries,
  });

  const handleMutationError = (err: unknown) => {
    console.error(err);
  };

  const heroes = heroesQuery.data ?? [];
  const heroesById = heroes.reduce<Record<number, HeroCache>>((acc, hero) => {
    acc[hero.id] = hero;
    return acc;
  }, {});

  const getHero = (heroId: number) => heroesById[heroId];
  const getHeroName = (heroId: number) => getHero(heroId)?.localizedName ?? `Hero #${heroId}`;

  const handleHeroSelect = async (heroId: number) => {
    try {
      if (browserMode === 'BAN') {
        await addListHeroMutation.mutateAsync({ heroId, type: 'BAN' });
      } else if (browserMode === 'PICK') {
        await addListHeroMutation.mutateAsync({ heroId, type: 'PREFERRED', role: 'Flex', priority: 'MEDIUM' });
      } else if (browserMode === 'THREAT') {
        await addThreatMutation.mutateAsync({ heroId, note: '' });
      }
      setBrowserMode(null);
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleUpdateBan = async (banId: number, note: string) => {
    try {
      await updateListHeroMutation.mutateAsync({ heroEntryId: banId, payload: { note } });
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleDeleteBan = async (banId: number) => {
    try {
      await removeListHeroMutation.mutateAsync(banId);
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleUpdatePick = async (pickId: number, updates: Partial<ListHero>) => {
    try {
      await updateListHeroMutation.mutateAsync({ heroEntryId: pickId, payload: updates });
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleDeletePick = async (pickId: number) => {
    try {
      await removeListHeroMutation.mutateAsync(pickId);
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleUpdateThreat = async (threatId: number, note: string) => {
    try {
      await updateThreatMutation.mutateAsync({ threatId, payload: { note } });
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleDeleteThreat = async (threatId: number) => {
    try {
      await removeThreatMutation.mutateAsync(threatId);
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleAddTiming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTiming.trim() || !newTimingExplanation.trim()) return;

    try {
      await addTimingMutation.mutateAsync({
        timing: newTiming.trim(),
        explanation: newTimingExplanation.trim(),
      });
      setNewTiming('');
      setNewTimingExplanation('');
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleUpdateTiming = async (timing: ItemTiming, updates: Partial<ItemTiming>) => {
    try {
      await updateTimingMutation.mutateAsync({
        timingId: timing.id,
        payload: {
          timing: updates.timing ?? timing.timing,
          explanation: updates.explanation ?? timing.explanation,
        },
      });
    } catch (err) {
      handleMutationError(err);
    }
  };

  const handleDeleteTiming = async (timingId: number) => {
    try {
      await removeTimingMutation.mutateAsync(timingId);
    } catch (err) {
      handleMutationError(err);
    }
  };

  if (planQuery.isLoading) {
    return <div className="text-center py-20 text-tactical-text-secondary">Loading operation data...</div>;
  }

  if (planQuery.isError || !planQuery.data) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="card p-8 text-center">
          <p className="text-tactical-error text-[16px] mb-4">Failed to load this draft plan.</p>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const plan: DraftPlanDetailData = planQuery.data;
  const bans = plan.heroes.filter((hero) => hero.type === 'BAN');
  const picks = plan.heroes.filter((hero) => hero.type === 'PREFERRED');
  const threats = plan.enemyThreats;
  const timings = plan.itemTimings;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6">
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

      <div className="flex bg-tactical-surface-dark border p-1 border-tactical-border rounded-lg shadow-subtle overflow-x-auto w-fit">
        {[
          { id: 'BANS', label: `Ban List (${bans.length})` },
          { id: 'PICKS', label: `Preferred Picks (${picks.length})` },
          { id: 'THREATS', label: `Enemy Threats (${threats.length})` },
          { id: 'TIMINGS', label: `Key Timings (${timings.length})` },
          { id: 'SUMMARY', label: 'Draft Summary' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-[14px] font-medium rounded-md whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-tactical-primary text-white shadow-subtle'
                : 'text-tactical-text-secondary hover:text-tactical-text-primary hover:bg-tactical-surface'
            }`}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {activeTab === 'BANS' && (
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-tactical-border pb-4">
              <h2 className="text-[20px] font-bold text-tactical-text-primary">Target Bans</h2>
              <button className="btn btn-danger" onClick={() => setBrowserMode('BAN')}>Add Ban</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bans.length === 0 && <p className="text-tactical-text-secondary text-[14px] col-span-full">No bans registered.</p>}
              {bans.map((ban) => {
                const hero = getHero(ban.heroId);
                const heroName = hero?.localizedName || getHeroName(ban.heroId);

                return (
                  <div key={ban.id} className="flex bg-tactical-surface-dark border border-tactical-border rounded-sm overflow-hidden min-h-24 shadow-subtle">
                    <HeroPortrait
                      name={heroName}
                      imageUrl={hero?.imageUrl}
                      className="w-24 shrink-0 border-r border-tactical-border"
                      fallbackClassName="bg-tactical-error"
                      labelClassName="text-[12px] text-tactical-text-primary"
                    />
                    <div className="p-3 flex flex-col flex-1 gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[16px] text-tactical-text-primary leading-none">{heroName}</h3>
                        <button onClick={() => void handleDeleteBan(ban.id)} className="text-[12px] text-tactical-text-secondary hover:text-tactical-error uppercase tracking-wider font-bold">
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ban.note || ''}
                        onChange={(e) => void handleUpdateBan(ban.id, e.target.value)}
                        placeholder="Reason for ban..."
                        className="text-[12px] bg-transparent border-b border-tactical-border text-tactical-text-primary placeholder:text-tactical-text-secondary focus:outline-none focus:border-tactical-primary pb-1 w-full mt-auto"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'PICKS' && (
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-tactical-border pb-4">
              <h2 className="text-[20px] font-bold text-tactical-text-primary">Preferred Picks</h2>
              <button className="btn btn-primary" onClick={() => setBrowserMode('PICK')}>Add Pick</button>
            </div>

            <div className="flex flex-col gap-4">
              {picks.length === 0 && <p className="text-tactical-text-secondary text-[14px]">No picks registered.</p>}
              {picks.map((pick) => {
                const hero = getHero(pick.heroId);
                const heroName = hero?.localizedName || getHeroName(pick.heroId);

                return (
                  <div key={pick.id} className="flex flex-col sm:flex-row bg-tactical-surface-dark border border-tactical-border rounded-sm shadow-subtle overflow-hidden">
                    <HeroPortrait
                      name={heroName}
                      imageUrl={hero?.imageUrl}
                      className="w-full sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-tactical-border"
                      fallbackClassName="bg-tactical-success"
                      labelClassName="text-tactical-text-primary"
                    />
                    <div className="p-4 flex flex-1 flex-wrap gap-4 items-end">
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Role</label>
                        <select
                          className="input-field h-8 text-[14px] bg-tactical-surface"
                          value={pick.role || 'Flex'}
                          onChange={(e) => void handleUpdatePick(pick.id, { role: e.target.value })}
                        >
                          <option value="Carry">Carry</option>
                          <option value="Mid">Mid</option>
                          <option value="Offlane">Offlane</option>
                          <option value="Support">Support</option>
                          <option value="Hard Support">Hard Support</option>
                          <option value="Flex">Flex</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Priority</label>
                        <select
                          className={`input-field h-8 text-[14px] font-bold ${prioritySelectClass(pick.priority)}`}
                          value={pick.priority || 'MEDIUM'}
                          onChange={(e) => void handleUpdatePick(pick.id, { priority: e.target.value as ListHero['priority'] })}
                        >
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Tactical Notes</label>
                        <input
                          type="text"
                          className="input-field h-8 text-[14px]"
                          placeholder="Synergy or draft condition..."
                          value={pick.note || ''}
                          onChange={(e) => void handleUpdatePick(pick.id, { note: e.target.value })}
                        />
                      </div>
                      <button onClick={() => void handleDeletePick(pick.id)} className="btn hover:bg-tactical-error hover:text-white border border-transparent text-tactical-text-secondary h-8 px-3 ml-auto shrink-0">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'THREATS' && (
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-tactical-border pb-4">
              <div>
                <h2 className="text-[20px] font-bold text-tactical-text-primary">Enemy Threats</h2>
                <p className="text-[14px] text-tactical-text-secondary mt-1">Track heroes your team wants to answer or counter.</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setBrowserMode('THREAT')}>Add Threat</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threats.length === 0 && <p className="text-tactical-text-secondary text-[14px] col-span-full">No enemy threats recorded.</p>}
              {threats.map((threat) => {
                const hero = getHero(threat.heroId);
                const heroName = hero?.localizedName || getHeroName(threat.heroId);

                return (
                  <div key={threat.id} className="flex bg-tactical-surface-dark border border-tactical-border rounded-sm overflow-hidden min-h-24 shadow-subtle">
                    <HeroPortrait
                      name={heroName}
                      imageUrl={hero?.imageUrl}
                      className="w-24 shrink-0 border-r border-tactical-border"
                      fallbackClassName="bg-tactical-warning"
                      labelClassName="text-[12px] text-tactical-text-primary"
                    />
                    <div className="p-3 flex flex-col flex-1 gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[16px] text-tactical-text-primary leading-none">{heroName}</h3>
                        <button onClick={() => void handleDeleteThreat(threat.id)} className="text-[12px] text-tactical-text-secondary hover:text-tactical-warning uppercase tracking-wider font-bold">
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={threat.note || ''}
                        onChange={(e) => void handleUpdateThreat(threat.id, e.target.value)}
                        placeholder="Why is this hero a threat?"
                        className="text-[12px] bg-transparent border-b border-tactical-border text-tactical-text-primary placeholder:text-tactical-text-secondary focus:outline-none focus:border-tactical-warning pb-1 w-full mt-auto"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'TIMINGS' && (
          <div className="card p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-tactical-border pb-4">
              <h2 className="text-[20px] font-bold text-tactical-text-primary">Key Item Timings</h2>
              <p className="text-[14px] text-tactical-text-secondary">Capture timing windows that matter for your draft execution.</p>
            </div>

            <form onSubmit={handleAddTiming} className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Timing</label>
                <input
                  type="text"
                  value={newTiming}
                  onChange={(e) => setNewTiming(e.target.value)}
                  placeholder="BKB ~18 min"
                  className="input-field"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Why it matters</label>
                <input
                  type="text"
                  value={newTimingExplanation}
                  onChange={(e) => setNewTimingExplanation(e.target.value)}
                  placeholder="Crucial against their magic burst."
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={addTimingMutation.isPending} className="btn btn-primary h-10">
                {addTimingMutation.isPending ? 'Adding...' : 'Add Timing'}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {timings.length === 0 && <p className="text-tactical-text-secondary text-[14px]">No timing notes recorded.</p>}
              {timings.map((timing) => (
                <div key={timing.id} className="card p-4 bg-tactical-surface-dark border border-tactical-border shadow-subtle">
                  <div className="flex flex-col md:flex-row gap-4 md:items-start">
                    <div className="flex flex-col gap-2 md:w-52">
                      <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Timing</label>
                      <input
                        type="text"
                        value={timing.timing}
                        onChange={(e) => void handleUpdateTiming(timing, { timing: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <label className="text-[12px] text-tactical-text-secondary uppercase tracking-wide font-bold">Explanation</label>
                      <input
                        type="text"
                        value={timing.explanation}
                        onChange={(e) => void handleUpdateTiming(timing, { explanation: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <button onClick={() => void handleDeleteTiming(timing.id)} className="btn btn-secondary md:mt-7 shrink-0 hover:bg-tactical-error hover:text-white">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SUMMARY' && (
          <div className="card p-6 flex flex-col gap-8 bg-tactical-surface-dark">
            <div className="flex flex-col gap-2">
              <h2 className="text-[24px] font-bold text-tactical-text-primary tracking-tight">Draft Strategy Summary</h2>
              <p className="text-[14px] text-tactical-text-secondary tracking-wide uppercase">Operational Overview - {plan.name}</p>
            </div>

            {plan.synergyNote && (
              <div className="border border-tactical-secondary/40 bg-tactical-secondary/10 rounded-sm p-4">
                <p className="text-[12px] text-tactical-text-secondary uppercase tracking-[0.2em] mb-2">Automated Synergy Note</p>
                <p className="text-[14px] text-tactical-text-primary">{plan.synergyNote}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-error uppercase tracking-wider border-b border-tactical-border pb-2">Target Bans</h3>
                {bans.length === 0 ? (
                  <p className="text-[12px] text-tactical-text-secondary">No bans assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {bans.map((ban) => {
                      const hero = getHero(ban.heroId);
                      const heroName = hero?.localizedName || getHeroName(ban.heroId);

                      return (
                        <li key={ban.id} className="flex items-center gap-3">
                          <HeroPortrait
                            name={heroName}
                            imageUrl={hero?.imageUrl}
                            className="w-12 h-12 rounded-sm shrink-0 border border-tactical-border"
                            fallbackClassName="bg-tactical-error"
                            labelClassName="text-[10px] text-tactical-text-primary"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[14px] text-tactical-text-primary">{heroName}</p>
                            <p className="text-[12px] text-tactical-text-secondary italic">{ban.note || 'No notes'}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-success uppercase tracking-wider border-b border-tactical-border pb-2">Priority Picks</h3>
                {picks.length === 0 ? (
                  <p className="text-[12px] text-tactical-text-secondary">No picks assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {picks.map((pick) => {
                      const hero = getHero(pick.heroId);
                      const heroName = hero?.localizedName || getHeroName(pick.heroId);

                      return (
                        <li key={pick.id} className="flex items-center gap-3">
                          <HeroPortrait
                            name={heroName}
                            imageUrl={hero?.imageUrl}
                            className="w-12 h-12 rounded-sm shrink-0 border border-tactical-border"
                            fallbackClassName="bg-tactical-success"
                            labelClassName="text-[10px] text-tactical-text-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[14px] text-tactical-text-primary">{heroName}</p>
                              <span className="text-[12px] text-tactical-text-secondary">{pick.role || 'Flex'}</span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${priorityStyles[pick.priority || 'LOW']}`}>
                                {formatPriority(pick.priority)}
                              </span>
                            </div>
                            <p className="text-[12px] text-tactical-text-secondary italic">{pick.note || 'No notes'}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-warning uppercase tracking-wider border-b border-tactical-border pb-2">Enemy Threats</h3>
                {threats.length === 0 ? (
                  <p className="text-[12px] text-tactical-text-secondary">No enemy threats assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {threats.map((threat) => {
                      const hero = getHero(threat.heroId);
                      const heroName = hero?.localizedName || getHeroName(threat.heroId);

                      return (
                        <li key={threat.id} className="flex items-center gap-3">
                          <HeroPortrait
                            name={heroName}
                            imageUrl={hero?.imageUrl}
                            className="w-12 h-12 rounded-sm shrink-0 border border-tactical-border"
                            fallbackClassName="bg-tactical-warning"
                            labelClassName="text-[10px] text-tactical-text-primary"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[14px] text-tactical-text-primary">{heroName}</p>
                            <p className="text-[12px] text-tactical-text-secondary italic">{threat.note || 'No notes'}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-[16px] font-bold text-tactical-secondary uppercase tracking-wider border-b border-tactical-border pb-2">Key Timings</h3>
                {timings.length === 0 ? (
                  <p className="text-[12px] text-tactical-text-secondary">No timing notes assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {timings.map((timing) => (
                      <li key={timing.id} className="border border-tactical-border rounded-sm p-3 bg-tactical-surface">
                        <p className="font-bold text-[14px] text-tactical-text-primary">{timing.timing}</p>
                        <p className="text-[12px] text-tactical-text-secondary italic mt-1">{timing.explanation}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {browserMode && (
        <HeroBrowser
          heroes={heroes}
          loading={heroesQuery.isLoading}
          mode={browserMode}
          onClose={() => setBrowserMode(null)}
          onSelect={(heroId) => void handleHeroSelect(heroId)}
        />
      )}
    </div>
  );
}
