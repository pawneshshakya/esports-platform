
// apps/web/src/components/events/EventFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const EventFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    game: searchParams.get('game') || '',
    minFee: searchParams.get('minFee') || '',
    maxFee: searchParams.get('maxFee') || '',
    city: searchParams.get('city') || '',
    sortBy: searchParams.get('sortBy') || 'scheduledAt'
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h3 className="font-bold text-white">Filters</h3>
      
      <div>
        <label className="text-sm text-muted-foreground">Game</label>
        <select 
          className="w-full bg-muted border border-border rounded px-3 py-2 text-white mt-1"
          value={filters.game}
          onChange={e => setFilters({...filters, game: e.target.value})}
        >
          <option value="">All Games</option>
          <option value="bgmi">BGMI</option>
          <option value="free_fire_max">Free Fire Max</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm text-muted-foreground">Min Fee</label>
          <input 
            type="number"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white mt-1"
            value={filters.minFee}
            onChange={e => setFilters({...filters, minFee: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Max Fee</label>
          <input 
            type="number"
            className="w-full bg-muted border border-border rounded px-3 py-2 text-white mt-1"
            value={filters.maxFee}
            onChange={e => setFilters({...filters, maxFee: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">City (Local Events)</label>
        <input 
          className="w-full bg-muted border border-border rounded px-3 py-2 text-white mt-1"
          value={filters.city}
          onChange={e => setFilters({...filters, city: e.target.value})}
          placeholder="Enter city name"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Sort By</label>
        <select 
          className="w-full bg-muted border border-border rounded px-3 py-2 text-white mt-1"
          value={filters.sortBy}
          onChange={e => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="scheduledAt">Date</option>
          <option value="prize">Prize Pool</option>
          <option value="fee">Entry Fee</option>
        </select>
      </div>

      <button 
        onClick={applyFilters}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-2 rounded-lg"
      >
        Apply Filters
      </button>
    </div>
  );
};