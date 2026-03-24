import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDraftPlans, createDraftPlan } from '../api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DraftPlansList() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: plans, isLoading } = useQuery({
    queryKey: ['draftPlans'],
    queryFn: getDraftPlans
  });

  const mutation = useMutation({
    mutationFn: createDraftPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draftPlans'] });
      setName('');
      setDescription('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) mutation.mutate({ name, description });
  };

  if (isLoading) return <div className="text-center py-20 text-dota-gold animate-pulse tracking-widest uppercase">Loading Drafts...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Create New Draft Panel */}
      <section className="dota-panel p-6 border-t-2 border-t-dota-gold">
        <h2 className="text-xl font-bold uppercase tracking-widest text-dota-text mb-4">Create New Draft Plan</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-dota-muted uppercase mb-1.5 tracking-wider">Plan Name</label>
            <input 
              type="text" 
              className="dota-input" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g., TI 13 Upper Bracket Strategy"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-dota-muted uppercase mb-1.5 tracking-wider">Description (Optional)</label>
            <input 
              type="text" 
              className="dota-input" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Draft focus notes..."
            />
          </div>
          <button type="submit" disabled={mutation.isPending} className="dota-btn dota-btn-primary w-full sm:w-auto h-[42px]">
            {mutation.isPending ? 'Saving...' : 'Save Plan'}
          </button>
        </form>
      </section>

      {/* Draft Plans List */}
      <section>
        <h2 className="text-2xl font-black uppercase tracking-widest text-white border-b border-dota-border pb-3 mb-6">Your Draft Plans</h2>
        {plans?.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-dota-border text-dota-muted uppercase tracking-widest text-sm">
            No draft plans discovered in the archives.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Link 
                key={plan.id} 
                to={`/draft/${plan.id}`}
                className="dota-panel p-5 group hover:border-dota-gold/50 transition-colors block cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-dota-gold transition-colors">{plan.name}</h3>
                  <span className="text-xs text-dota-muted font-mono">{new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-dota-muted line-clamp-2 min-h-[40px]">
                  {plan.description || <span className="italic opacity-50">No description provided</span>}
                </p>
                <div className="mt-4 pt-4 border-t border-dota-border flex justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-dota-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Plan →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
