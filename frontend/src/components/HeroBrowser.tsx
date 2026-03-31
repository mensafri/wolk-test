import { useState } from 'react';
import type { HeroCache } from '../types';
import HeroPortrait from './HeroPortrait';

type HeroBrowserProps = {
  heroes: HeroCache[];
  loading: boolean;
  mode: 'BAN' | 'PICK' | 'THREAT';
  onClose: () => void;
  onSelect: (heroId: number) => void;
};

const modeCopy = {
  BAN: {
    title: 'Declare Ban Target',
    description: 'Search the synced OpenDota hero registry to lock a ban target.',
    barClassName: 'bg-tactical-error',
    buttonClassName: 'bg-transparent text-tactical-error border-tactical-error hover:bg-tactical-error hover:text-white',
  },
  PICK: {
    title: 'Select Priority Pick',
    description: 'Search the synced OpenDota hero registry to shortlist a preferred pick.',
    barClassName: 'bg-tactical-success',
    buttonClassName: 'bg-transparent text-tactical-success border-tactical-success hover:bg-tactical-success hover:text-white',
  },
  THREAT: {
    title: 'Add Enemy Threat',
    description: 'Pick an opposing hero your team wants to respond to or counter.',
    barClassName: 'bg-tactical-warning',
    buttonClassName: 'bg-transparent text-tactical-warning border-tactical-warning hover:bg-tactical-warning hover:text-tactical-bg',
  },
} as const;

export default function HeroBrowser({ heroes, loading, mode, onClose, onSelect }: HeroBrowserProps) {
  const copy = modeCopy[mode];
  const [searchValue, setSearchValue] = useState('');

  const filtered = heroes.filter(hero =>
    hero.localizedName.toLowerCase().includes(searchValue.toLowerCase()) ||
    hero.roles.some(role => role.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-tactical-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card w-full max-w-5xl max-h-[90vh] flex flex-col shadow-strong border border-tactical-border relative overflow-hidden">
        <div className={`h-2 w-full absolute top-0 left-0 ${copy.barClassName}`} />

        <div className="p-6 border-b border-tactical-border flex justify-between items-center mt-2 gap-4">
          <div>
            <h2 className="text-[24px] font-bold text-tactical-text-primary tracking-tight">
              {copy.title}
            </h2>
            <p className="text-[14px] text-tactical-text-secondary mt-1">{copy.description}</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary text-[12px] h-8 px-3 shrink-0">
            Cancel
          </button>
        </div>

        <div className="p-6 border-b border-tactical-border bg-tactical-surface-dark shrink-0">
          <input
            type="text"
            placeholder="Search heroes by name or role..."
            className="input-field w-full max-w-md bg-tactical-surface"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
          />
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-tactical-text-secondary text-[14px] tracking-widest uppercase">
              Syncing hero registry...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(hero => (
                <div key={hero.id} className="flex flex-col bg-tactical-surface-dark border border-tactical-border rounded-sm overflow-hidden hover:border-tactical-primary transition-colors group">
                  <HeroPortrait
                    name={hero.localizedName}
                    imageUrl={hero.imageUrl}
                    className="aspect-video border-b border-tactical-border"
                    imgClassName="group-hover:scale-[1.03] transition-transform duration-300"
                    fallbackClassName={mode === 'BAN' ? 'bg-tactical-error' : mode === 'PICK' ? 'bg-tactical-success' : 'bg-tactical-warning'}
                    labelClassName="text-[14px] text-tactical-text-secondary group-hover:text-tactical-text-primary transition-colors"
                  />
                  <div className="p-3 flex flex-col gap-3">
                    <div className="min-h-[2.5rem]">
                      <p className="font-bold text-[14px] text-tactical-text-primary leading-tight">{hero.localizedName}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hero.roles.slice(0, 3).map(role => (
                          <span key={role} className="text-[10px] px-1.5 py-0.5 bg-tactical-surface border border-tactical-border text-tactical-text-secondary font-medium tracking-wide rounded-sm truncate max-w-full">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className={`w-full text-[12px] h-8 font-bold tracking-wide transition-all border shrink-0 ${copy.buttonClassName}`}
                      onClick={() => onSelect(hero.id)}
                    >
                      SELECT
                    </button>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-tactical-text-secondary">
                  No heroes match your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
