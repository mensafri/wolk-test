import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDraftPlans, createDraftPlan } from '../api';

export default function DraftPlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getDraftPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch draft plans', err);
    }
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createDraftPlan({ name, description });
      setName('');
      setDescription('');
      fetchPlans();
    } catch (err) {
      console.error('Failed to create plan', err);
    }
  };

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
            <label className="text-[14px] font-medium text-tactical-text-secondary" htmlFor="Plan Name">Plan Name</label>
            <input
              id="Plan Name"
              type="text"
              className="input-field"
              placeholder="e.g. TI Finals Base Strat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[14px] font-medium text-tactical-text-secondary" htmlFor="Description (Optional)">Description (Optional)</label>
            <input
              id="Description (Optional)"
              type="text"
              className="input-field"
              placeholder="Internal operational notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="btn btn-primary w-full shadow-subtle">
              Save Plan
            </button>
          </div>
        </form>
      </div>

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
                  Bans <span className="text-tactical-error font-medium ml-1">{plan.bans?.length || 0}</span>
                </span>
                <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                  Picks <span className="text-tactical-success font-medium ml-1">{plan.picks?.length || 0}</span>
                </span>
                <span className="bg-tactical-surface-dark px-2 py-1 rounded-sm border border-tactical-border whitespace-nowrap">
                  Threats <span className="text-tactical-warning font-medium ml-1">{plan.threats?.length || 0}</span>
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
    </div>
  );
}
