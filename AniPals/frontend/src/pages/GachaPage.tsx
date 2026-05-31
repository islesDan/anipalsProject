import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PixelAvatar } from '../components/PixelAvatar';
import { localGachaService } from '../services/localGame';
import { setCurrencies } from '../services/currency';
import type { GachaHistoryItem } from '../types/game';

type GachaStatus = {
  ssrPity: number;
  srPity: number;
  guaranteedFeatured: boolean;
  singleCost: number;
  tenPullCost: number;
  currencies: {
    coins: number;
    gems: number;
    energy: number;
    sprouts: number;
    tickets: number;
  };
  history: GachaHistoryItem[];
  gemBundles: Array<{ id: 'small' | 'medium' | 'large'; gems: number; coins: number; label: string }>;
  status: string;
};

const fallbackStatus: GachaStatus = {
  ssrPity: 0,
  srPity: 0,
  guaranteedFeatured: false,
  singleCost: 160,
  tenPullCost: 1600,
  currencies: {
    coins: 12840,
    gems: 3200,
    energy: 78,
    sprouts: 36,
    tickets: 0,
  },
  history: [],
  gemBundles: [
    { id: 'small', gems: 160, coins: 1600, label: 'Starter pouch' },
    { id: 'medium', gems: 800, coins: 7600, label: 'Barn bundle' },
    { id: 'large', gems: 1600, coins: 14400, label: 'Harvest chest' },
  ],
  status: 'Choose Pull 1 or Pull 10.',
};

export function GachaPage() {
  const [gacha, setGacha] = useState<GachaStatus>(fallbackStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    localGachaService.status().then((next) => {
      if (active) syncStatus(next);
    });

    return () => {
      active = false;
    };
  }, []);

  function syncStatus(next: GachaStatus) {
    setGacha(next);
    setCurrencies({
      coins: next.currencies.coins,
      gems: next.currencies.gems,
      energy: next.currencies.energy,
      sprouts: next.currencies.sprouts,
    });
  }

  async function pull(count: 1 | 10) {
    setLoading(true);
    const next = await localGachaService.pull(count);
    syncStatus(next);
    setLoading(false);
  }

  async function buyGems(bundleId: 'small' | 'medium' | 'large') {
    const next = await localGachaService.buyGems(bundleId);
    syncStatus(next);
  }

  const nextFeaturedText = gacha.guaranteedFeatured ? 'Next SSR guaranteed featured' : 'Next SSR is 50/50';

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card title="Season Banner" className="overflow-hidden">
        <div className="pixel-grid rounded-2xl bg-gradient-to-br from-berry via-orange-300 to-sun p-6 text-white">
          <p className="text-sm font-black uppercase tracking-wide text-white/80">Limited Companion Banner</p>
          <h2 className="mt-2 text-4xl font-black">Harvest Helpers</h2>
          <p className="mt-3 max-w-xl text-sm font-bold text-white/90">SSR 1%, SR 9%+, R 90%. Hard pity guarantees SSR at 100 pulls. Duplicates become AniShards.</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid h-52 flex-1 place-items-center rounded-2xl border-4 border-white/70 bg-white/25">
              <div className="flex items-end gap-4">
                <PixelAvatar name="Pip" palette="bg-pink-300" size="lg" />
                <PixelAvatar name="Neo" palette="bg-cyan-300" size="lg" />
                <PixelAvatar name="Sol" palette="bg-yellow-300" size="lg" />
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl bg-white/85 p-4 text-ink shadow-pixel">
              <div>
                <div className="text-xs font-black text-ink/60">SSR Pity</div>
                <div className="text-3xl font-black">{gacha.ssrPity} / 100</div>
                <div className="mt-2 h-3 rounded-full bg-cream">
                  <div className="h-3 rounded-full bg-berry" style={{ width: `${Math.min(gacha.ssrPity, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-cream p-3 text-xs font-black text-ink/70">
                SR+ guarantee: {gacha.srPity} / 10
              </div>
              <div className="rounded-xl bg-cream p-3 text-xs font-black text-berry">
                {nextFeaturedText}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_220px]">
          <Button className="inline-flex items-center justify-center gap-2 py-3" onClick={() => pull(1)} disabled={loading}><SeedPullIcon /> Pull 1</Button>
          <Button variant="secondary" className="inline-flex items-center justify-center gap-2 py-3" onClick={() => pull(10)} disabled={loading}><SeedPullIcon cluster /> Pull 10</Button>
          <div className="rounded-xl bg-cream px-4 py-3 text-sm font-black">
            Spend coins for gems below
          </div>
          <div className="rounded-xl bg-cream px-4 py-3 text-sm font-black">
            {gacha.currencies.gems.toLocaleString()} gems
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {gacha.gemBundles.map((bundle) => (
            <button
              key={bundle.id}
              type="button"
              onClick={() => buyGems(bundle.id)}
              disabled={loading}
              className="rounded-xl border-2 border-ink/10 bg-white p-4 text-left shadow-pixel transition hover:-translate-y-0.5 hover:border-berry disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-black text-berry"><CoinSproutIcon /> {bundle.label}</span>
              <span className="block text-lg font-black">{bundle.gems.toLocaleString()} gems</span>
              <span className="text-sm font-bold text-ink/60">{bundle.coins.toLocaleString()} coins</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 rounded-xl bg-cream p-4 text-sm font-bold text-ink/70 sm:grid-cols-4">
          <span>Pull 1: {gacha.singleCost} gems</span>
          <span>Pull 10: {gacha.tenPullCost} gems</span>
          <span>Small gems: 1,600 coins</span>
          <span>Featured max: 32,000 gems</span>
        </div>

        <p className="mt-4 rounded-xl bg-cream p-4 text-sm font-bold text-ink/70" aria-live="polite">
          {loading ? 'Summoning...' : gacha.status}
        </p>
      </Card>

      <Card title="Pull History">
        <div className="grid gap-3">
          {gacha.history.length === 0 && (
            <p className="rounded-xl bg-cream p-4 text-sm font-bold text-ink/70">No pulls yet.</p>
          )}
          {gacha.history.map((item) => (
            <div key={item.id} className="rounded-xl border-2 border-ink/10 bg-cream p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{item.result}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-berry">
                  {item.rarity}{item.featured ? ' Featured' : ''}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-ink/60">{item.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SeedPullIcon({ cluster = false }: { cluster?: boolean }) {
  return (
    <span className="relative inline-block h-6 w-7 align-middle">
      <span className="absolute bottom-0 left-3 h-5 w-1.5 rounded-full bg-green-800" />
      <span className="absolute left-0 top-1.5 h-3 w-5 -rotate-12 rounded-full bg-lime-300" />
      <span className="absolute right-0 top-0 h-3 w-4 rotate-12 rounded-full bg-meadow" />
      {cluster && <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-sun shadow-pixel" />}
    </span>
  );
}

function CoinSproutIcon() {
  return (
    <span className="relative inline-block h-6 w-7 align-middle">
      <span className="absolute bottom-0 left-0 h-5 w-5 rounded-full border-2 border-white/70 bg-sun" />
      <span className="absolute bottom-1 right-1 h-4 w-1.5 rounded-full bg-green-800" />
      <span className="absolute right-0 top-1 h-3 w-4 rounded-full bg-lime-300" />
    </span>
  );
}
