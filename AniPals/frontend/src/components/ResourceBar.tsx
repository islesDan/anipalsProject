import { useEffect, useState } from 'react';
import { useMockGame } from '../hooks/useMockGame';
import { currencyEvent, type CurrencyState } from '../services/currency';

export function ResourceBar() {
  const { currencies } = useMockGame();
  const [currentCurrencies, setCurrentCurrencies] = useState(currencies);

  useEffect(() => {
    function handleCurrencyChange(event: Event) {
      setCurrentCurrencies((event as CustomEvent<CurrencyState>).detail);
    }

    window.addEventListener(currencyEvent, handleCurrencyChange);
    return () => window.removeEventListener(currencyEvent, handleCurrencyChange);
  }, []);

  const resources = [
    ['Coins', currentCurrencies.coins.toLocaleString(), 'bg-sun'],
    ['Gems', currentCurrencies.gems.toLocaleString(), 'bg-pond text-white'],
    ['Energy', `${currentCurrencies.energy}/100`, 'bg-meadow text-white'],
    ['Sprouts', currentCurrencies.sprouts.toString(), 'bg-lime-300'],
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
