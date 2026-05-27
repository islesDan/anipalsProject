import type { InventoryItem } from '../types/game';

type InventoryGridProps = {
  items: InventoryItem[];
  selectable?: boolean;
};

const rarityStyles = {
  Common: 'border-stone-300 text-stone-600',
  Uncommon: 'border-meadow text-green-700',
  Rare: 'border-pond text-sky-700',
  Epic: 'border-berry text-rose-700',
};

export function InventoryGrid({ items, selectable = false }: InventoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`group rounded-xl border-2 bg-white p-3 text-left shadow-pixel transition hover:-translate-y-1 hover:border-berry ${selectable ? 'cursor-pointer' : 'cursor-default'} ${rarityStyles[item.rarity]}`}
        >
          <div className={`mb-3 h-14 w-full rounded-lg border-2 border-white shadow-inner ${item.color}`}>
            <div className="mx-auto mt-3 h-7 w-7 border-2 border-white/70 bg-white/50" />
          </div>
          <div className="min-h-10 text-sm font-black text-ink">{item.name}</div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-bold">
            <span>{item.type}</span>
            <span>x{item.quantity}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
