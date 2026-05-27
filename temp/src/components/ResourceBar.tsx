import { useMockGame } from '../hooks/useMockGame';

export function ResourceBar() {
  const { currencies } = useMockGame();
  const resources = [
    ['Coins', currencies.coins.toLocaleString(), 'bg-sun'],
    ['Gems', currencies.gems.toLocaleString(), 'bg-pond text-white'],
    ['Energy', `${currencies.energy}/100`, 'bg-meadow text-white'],
    ['Sprouts', currencies.sprouts.toString(), 'bg-lime-300'],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {resources.map(([label, value, color]) => (
        <div key={label} className="rounded-xl border-2 border-white bg-white/80 p-3 shadow-pixel">
          <div className={`mb-2 h-3 rounded-full ${color}`} />
          <div className="text-xs font-black uppercase tracking-wide text-ink/60">{label}</div>
          <div className="text-lg font-black text-ink">{value}</div>
        </div>
      ))}
    </div>
  );
}
