import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { InventoryGrid } from '../components/InventoryGrid';
import { useMockGame } from '../hooks/useMockGame';
import { localGameService } from '../services/localGame';
import { setCurrencies } from '../services/currency';
import type { GameState, InventoryItem } from '../types/game';

type InventoryFilter = 'All' | InventoryItem['type'];

const filters: InventoryFilter[] = ['All', 'Seed', 'Crop', 'Tool', 'Decor', 'Treat', 'Material'];

export function InventoryPage() {
  const fallbackGame = useMockGame();
  const [game, setGame] = useState<GameState | null>(null);
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>('All');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [status, setStatus] = useState('Select an item to inspect it.');
  const inventory = game?.inventory ?? fallbackGame.inventory;

  useEffect(() => {
    localGameService.state().then(syncGameState);
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedItem(inventory[0] ?? null);
      return;
    }

    const updatedSelection = inventory.find((item) => item.id === selectedItem.id);
    setSelectedItem(updatedSelection ?? inventory[0] ?? null);
  }, [inventory, selectedItem]);

  function syncGameState(next: GameState) {
    setGame(next);
    setCurrencies({
      coins: next.currencies.coins,
      gems: next.currencies.gems,
      energy: next.currencies.energy,
      sprouts: next.currencies.sprouts,
    });
    setStatus(next.status);
  }

  const visibleItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesFilter = activeFilter === 'All' || item.type === activeFilter;
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, inventory, query]);

  async function useItem() {
    if (!selectedItem) return;
    const next = await localGameService.useInventoryItem(selectedItem.id);
    syncGameState(next);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <Card title="Inventory Grid">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_240px]">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Inventory filters">
            {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border-2 px-4 py-2 text-xs font-black transition hover:border-berry hover:text-berry ${
                activeFilter === filter ? 'border-berry bg-rose-50 text-berry' : 'border-ink/10 bg-cream'
              }`}
            >
              {filter === 'All' ? 'All' : `${filter}s`}
            </button>
          ))}
          </div>
          <FormField
            label="Search"
            placeholder="Find item"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <InventoryGrid items={visibleItems} selectable selectedIds={selectedItem ? [selectedItem.id] : []} onSelect={setSelectedItem} />
        {visibleItems.length === 0 && <p className="mt-4 rounded-xl bg-cream p-4 text-sm font-bold text-ink/70">No items match this filter.</p>}
      </Card>

      <Card title="Item Details">
        {selectedItem ? (
          <div className="grid gap-4">
            <div className={`h-28 rounded-2xl border-4 border-white ${selectedItem.color} shadow-pixel`} />
            <div>
              <h3 className="text-2xl font-black">{selectedItem.name}</h3>
              <p className="mt-1 text-sm font-bold text-ink/65">{selectedItem.rarity} {selectedItem.type} - x{selectedItem.quantity}</p>
              <p className="mt-3 rounded-xl bg-cream p-3 text-sm font-bold text-ink/70">{itemUseHint(selectedItem)}</p>
            </div>
            <div className="grid gap-2">
              <Button type="button" onClick={useItem}>Use Item</Button>
            </div>
            <p className="rounded-xl bg-cream p-4 text-sm font-bold text-ink/70" aria-live="polite">{status}</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-ink/70">Choose an item from the grid.</p>
        )}
      </Card>
    </div>
  );
}

function itemUseHint(item: InventoryItem) {
  const normalized = item.name.toLowerCase();

  if (normalized.includes('watering')) return 'Use: spend 8 energy to reduce all growing crop timers by 25 seconds.';
  if (normalized.includes('compost')) return 'Use: spend 4 energy and one compost to make one growing crop ready.';
  if (normalized.includes('hoe')) return 'Use: spend 6 energy to tend cleared soil and gain sprouts.';
  if (item.type === 'Seed') return 'Use: plants this seed in the first cleared farm plot.';
  if (item.type === 'Crop') return 'Use: sell this crop for coins.';
  if (item.type === 'Treat') return 'Use: feed the first AniPal for energy and XP.';
  if (item.type === 'Decor') return 'Use: place this decor visibly on your farm.';
  if (item.type === 'Material') return 'Use: convert this material into energy, sprouts, coins, or gems.';
  return 'Use: stores this item for trading.';
}
