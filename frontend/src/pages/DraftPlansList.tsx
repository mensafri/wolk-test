import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDraftPlans, createDraftPlan } from '../api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function DraftPlansList() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['draft-plans'],
    queryFn: getDraftPlans
  });

  const createMutation = useMutation({
    mutationFn: createDraftPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-plans'] });
      setIsCreating(false);
      setName('');
      setDescription('');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createMutation.mutate({ name, description });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Draft Plans</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create New Plan
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">New Draft Plan</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g., TI13 Finals Game 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Draft Plan'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading draft plans...</div>
      ) : plans?.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400 mb-4">No draft plans found.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Create your first draft plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map(plan => (
            <Link
              key={plan.id}
              to={`/draft/${plan.id}`}
              className="group bg-slate-800 border border-slate-700 hover:border-emerald-500/50 p-6 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col h-full"
            >
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {plan.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-3">
                {plan.description || 'No description provided.'}
              </p>
              <div className="text-xs text-slate-500 mt-auto pt-4 border-t border-slate-700/50">
                Created on {format(new Date(plan.createdAt), 'MMM d, yyyy')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
