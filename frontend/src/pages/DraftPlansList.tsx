import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDraftPlan, getDraftPlans } from '../api';

export default function DraftPlansList() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['draft-plans'],
    queryFn: getDraftPlans,
  });

  const createPlanMutation = useMutation({
    mutationFn: createDraftPlan,
    onSuccess: async () => {
      setName('');
      setDescription('');
      setCreateError(null);
      await queryClient.invalidateQueries({ queryKey: ['draft-plans'] });
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.error || 'Failed to create draft plan.');
    },
  });

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPlanMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  const plans = plansQuery.data ?? [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-tight text-tactical-text-primary">Your Draft Plans</h1>
        <p className="text-[16px] text-tactical-text-secondary">Manage and prepare your active drafting strategies.</p>
      </div>

      <div className="card p-6 border-l-4 border-l-tactical-primary">
        <h2 className="text-[20px] font-bold mb-4">Create New Plan</h2>
        <form onSubmit={createPlan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-[14px] font-medium text-tactical-text-secondary" htmlFor="plan-name">Plan Name</label>
            <input
              id="plan-name"
              type="text"
              className="input-field"
              placeholder="e.g. TI Finals Base Strat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[14px] font-medium text-tactical-text-secondary" htmlFor="plan-description">Description (Optional)</label>
            <input
              id="plan-description"
              type="text"
              className="input-field"
              placeholder="Internal operational notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={createPlanMutation.isPending} className="btn btn-primary w-full shadow-subtle">
              {createPlanMutation.isPending ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
        {createError && (
          <p className="mt-4 text-[13px] text-tactical-error">{createError}</p>
        )}
      </div>

      {plansQuery.isLoading && (
        <div className="card p-12 text-center text-tactical-text-secondary">
          Loading draft plans...
        </div>
      )}

      {plansQuery.isError && (
        <div className="card p-12 text-center text-tactical-error">
          Failed to load draft plans.
        </div>
      )}

      {!plansQuery.isLoading && !plansQuery.isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card p-6 hover:border-tactical-secondary transition-colors cursor-pointer group"
              onClick={() => navigate(`/draft/${plan.id}`)}
            >
              <div className="flex flex-col h-full gap-4">
                <div>
                  <h3 className="text-[20px] font-bold text-tactical-text-primary group-hover:text-tactical-secondary transition-colors truncate">
                    {plan.name}
                  </h3>
                  <p className="text-[14px] text-tactical-text-secondary line-clamp-2 mt-1">
                    {plan.description || 'No description.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[12px] text-tactical-text-primary mt-auto border-t border-tactical-border pt-4">
                  <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                    Bans <span className="text-tactical-error font-medium ml-1">{plan.banCount}</span>
                  </span>
                  <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                    Picks <span className="text-tactical-success font-medium ml-1">{plan.pickCount}</span>
                  </span>
                  <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                    Threats <span className="text-tactical-warning font-medium ml-1">{plan.threatCount}</span>
                  </span>
                  <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                    Timings <span className="text-tactical-secondary font-medium ml-1">{plan.timingCount}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center border-dashed border-tactical-border bg-transparent shadow-none">
              <p className="text-[16px] text-tactical-text-secondary mb-2">No active draft operations.</p>
              <p className="text-[14px] text-tactical-text-secondary opacity-70">Initialize a new plan above to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
