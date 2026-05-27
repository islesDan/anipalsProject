import { useMockGame } from '../hooks/useMockGame';

export function WeatherBanner() {
  const { weather } = useMockGame();

  return (
    <div className="pixel-grid rounded-2xl border-4 border-white bg-gradient-to-r from-sky-200 via-yellow-100 to-lime-200 p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-ink/60">Weather Event</p>
          <h2 className="text-2xl font-black text-ink">{weather.title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-bold text-ink/75">{weather.detail}</p>
        </div>
        <div className="rounded-xl border-2 border-white bg-white/80 px-5 py-3 text-center shadow-pixel">
          <div className="text-xs font-black text-ink/60">Temp</div>
          <div className="text-xl font-black text-ink">{weather.temperature}</div>
        </div>
      </div>
    </div>
  );
}
