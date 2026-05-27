import { Card } from '../components/Card';
import { InventoryGrid } from '../components/InventoryGrid';
import { useMockGame } from '../hooks/useMockGame';

export function InventoryPage() {
  const { inventory } = useMockGame();

  return (
    <div className="grid gap-5">
      <Card title="Inventory Grid">
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', 'Seeds', 'Crops', 'Tools', 'Decor', 'Treats'].map((filter) => (
            <button
              key={filter}
              type="button"
              className="rounded-full border-2 border-ink/10 bg-cream px-4 py-2 text-xs font-black transition hover:border-berry hover:text-berry"
            >
              {filter}
            </button>
          ))}
        </div>
        <InventoryGrid items={inventory} />
      </Card>
    </div>
  );
}
