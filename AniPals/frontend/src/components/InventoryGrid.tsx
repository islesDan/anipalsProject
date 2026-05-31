import type { InventoryItem } from '../types/game';

type InventoryGridProps = {
  items: InventoryItem[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (item: InventoryItem) => void;
};

const rarityStyles = {
  Common: 'border-stone-300 text-stone-600',
  Uncommon: 'border-meadow text-green-700',
  Rare: 'border-pond text-sky-700',
  Epic: 'border-berry text-rose-700',
};

export function InventoryGrid({ items, selectable = false, selectedIds = [], onSelect }: InventoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onSelect?.(item)}
          aria-pressed={selectedIds.includes(item.id)}
          className={`group rounded-xl border-2 bg-white p-3 text-left shadow-pixel transition hover:-translate-y-1 hover:border-berry focus:outline-none focus:ring-4 focus:ring-berry/30 ${
            selectedIds.includes(item.id) ? 'ring-4 ring-berry/30' : ''
          } ${selectable ? 'cursor-pointer' : 'cursor-default'} ${rarityStyles[item.rarity]}`}
        >
          <div className={`mb-3 grid h-16 w-full place-items-center rounded-lg border-2 border-white shadow-inner ${item.color || 'bg-lime-200'}`}>
            <ItemIcon item={item} />
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

function ItemIcon({ item }: { item: InventoryItem }) {
  const normalized = item.name.toLowerCase();
  if (normalized.includes('carrot')) {
    return (
      <div className="relative h-10 w-10">
        <span className="absolute left-4 top-4 h-6 w-3 rounded-b-full rounded-t-sm bg-orange-500 shadow-pixel" />
        <span className="absolute left-2 top-1 h-5 w-3 rounded-full bg-green-500" style={{ transform: 'rotate(-35deg)' }} />
        <span className="absolute left-4 top-0 h-5 w-3 rounded-full bg-lime-400" />
        <span className="absolute right-2 top-1 h-5 w-3 rounded-full bg-green-600" style={{ transform: 'rotate(35deg)' }} />
      </div>
    );
  }

  if (normalized.includes('wheat')) {
    return (
      <div className="relative h-10 w-10">
        {[11, 19, 27].map((x) => (
          <span key={x} className="absolute bottom-1 h-8 w-1 rounded-full bg-amber-800" style={{ left: x, transform: `rotate(${x - 19}deg)` }}>
            <span className="absolute -left-1 top-0 h-5 w-3 rounded-full bg-yellow-300" />
          </span>
        ))}
      </div>
    );
  }

  if (normalized.includes('rice')) {
    return (
      <div className="relative h-10 w-10">
        <span className="absolute bottom-1 left-5 h-8 w-1.5 rounded-full bg-green-700" />
        {[8, 15, 22, 29].map((x, index) => (
          <span key={x} className="absolute h-4 w-2 rounded-full bg-yellow-100 shadow-pixel" style={{ left: x, top: 8 + (index % 2) * 5 }} />
        ))}
      </div>
    );
  }

  if (normalized.includes('honey')) {
    return <span className="grid h-10 w-10 place-items-center rounded-xl border-4 border-white/70 bg-amber-300 shadow-pixel"><span className="h-4 w-4 rounded-full bg-yellow-100" /></span>;
  }

  if (normalized.includes('berry')) {
    return <span className="grid h-10 w-10 place-items-center rounded-xl border-4 border-white/70 bg-rose-500 shadow-pixel"><span className="h-3 w-3 rounded-full bg-white/80" /></span>;
  }

  if (normalized.includes('clover')) {
    return (
      <div className="relative h-10 w-10">
        <span className="absolute bottom-1 left-5 h-5 w-1 rounded-full bg-green-800" />
        <span className="absolute left-2 top-2 h-4 w-4 rounded-full bg-emerald-400" />
        <span className="absolute right-2 top-2 h-4 w-4 rounded-full bg-emerald-500" />
        <span className="absolute left-3 top-5 h-4 w-4 rounded-full bg-green-400" />
      </div>
    );
  }

  if (normalized.includes('moon milk')) {
    return <span className="h-10 w-8 rounded-b-xl rounded-t-full border-4 border-white/70 bg-sky-100 shadow-pixel" />;
  }

  if (item.type === 'Seed') {
    return (
      <div className="relative h-9 w-9">
        <span className="absolute bottom-1 left-4 h-7 w-2 rounded-full bg-green-700" />
        <span className="absolute left-1 top-2 h-4 w-7 -rotate-12 rounded-full bg-lime-300 shadow-pixel" />
        <span className="absolute right-1 top-1 h-4 w-6 rotate-12 rounded-full bg-green-400 shadow-pixel" />
      </div>
    );
  }

  if (item.type === 'Crop') {
    return <span className="h-9 w-9 rounded-full border-4 border-white/70 bg-gradient-to-br from-yellow-200 to-orange-400 shadow-pixel" />;
  }

  if (item.type === 'Tool') {
    return (
      <div className="relative h-10 w-10 rotate-[-24deg]">
        <span className="absolute left-4 top-1 h-9 w-2 rounded-full bg-amber-900" />
        <span className="absolute left-1 top-0 h-3 w-8 rounded bg-slate-200 shadow-pixel" />
      </div>
    );
  }

  if (item.type === 'Treat') {
    return <span className="grid h-9 w-9 place-items-center rounded-xl border-4 border-white/70 bg-rose-500 shadow-pixel"><span className="h-3 w-3 rounded-full bg-white/80" /></span>;
  }

  if (item.type === 'Decor') {
    return (
      <div className="relative h-10 w-8">
        <span className="absolute inset-x-1 top-1 h-7 rounded-t-full bg-cyan-200 shadow-pixel" />
        <span className="absolute inset-x-0 bottom-0 h-3 rounded bg-amber-800" />
        <span className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-sun" />
      </div>
    );
  }

  return <span className="h-9 w-9 rotate-45 rounded-lg border-4 border-white/70 bg-violet-300 shadow-pixel" />;
}
