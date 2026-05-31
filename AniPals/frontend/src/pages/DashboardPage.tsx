import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PixelAvatar } from '../components/PixelAvatar';
import { WeatherBanner } from '../components/WeatherBanner';
import { useMockGame } from '../hooks/useMockGame';
import { localGameService } from '../services/localGame';
import { setCurrencies } from '../services/currency';
import type { AnimalProduct, FarmPlot as FarmPlotType, GameState, InventoryItem, OrchardTree, PageId, PondStatus } from '../types/game';

const cropLabels: Record<string, string> = {
  'rice-grain': 'Rice Grain',
  carrots: 'Carrots',
  wheat: 'Wheat',
  'moon-turnip': 'Moon Turnip',
  'star-melon': 'Star Melon',
  'cloud-cotton': 'Cloud Cotton',
};

export function DashboardPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const fallbackGame = useMockGame();
  const [game, setGame] = useState<GameState | null>(null);
  const [farmStatus, setFarmStatus] = useState('Tap ripe crops to harvest, collect from the pond, or give treats to AniPals.');
  const [selectedSeedId, setSelectedSeedId] = useState('');

  useEffect(() => {
    loadGameState();
    const timer = window.setInterval(loadGameState, 5000);
    return () => window.clearInterval(timer);
  }, []);

  function syncGameState(next: GameState) {
    setGame(next);
    setCurrencies({
      coins: next.currencies.coins,
      gems: next.currencies.gems,
      energy: next.currencies.energy,
      sprouts: next.currencies.sprouts,
    });
    setFarmStatus(next.status);
  }

  async function loadGameState() {
    const next = await localGameService.state();
    syncGameState(next);
  }

  async function handleHarvest(plotIndex: number) {
    const next = await localGameService.harvest(plotIndex);
    syncGameState(next);
  }

  async function handlePlant(plotIndex: number, seedId?: string) {
    const next = await localGameService.plant(plotIndex, seedId || selectedSeedId || undefined);
    syncGameState(next);
  }

  async function handleOrchardHarvest(treeIndex: number) {
    const next = await localGameService.harvestOrchard(treeIndex);
    syncGameState(next);
  }

  async function handlePondCollect() {
    const next = await localGameService.collectPond();
    syncGameState(next);
  }

  async function handleAnimalCollect(animalIndex: number) {
    const next = await localGameService.collectAnimalProduct(animalIndex);
    syncGameState(next);
  }

  async function giveTreat(aniPalId: string, treatId?: string) {
    const next = await localGameService.giveTreat(aniPalId, treatId);
    syncGameState(next);
  }

  async function claimQuest(questId: string) {
    const next = await localGameService.claimQuest(questId);
    syncGameState(next);
  }

  const anipals = game?.anipals ?? fallbackGame.anipals;
  const treats = (game?.inventory ?? fallbackGame.inventory).filter((item) => item.type === 'Treat' && item.quantity > 0);
  const seeds = (game?.inventory ?? fallbackGame.inventory).filter((item) => item.type === 'Seed' && item.quantity > 0);
  const quests = game?.quests ?? fallbackGame.quests;
  const farmName = game?.player.farmName ?? fallbackGame.player.farmName;
  const farmDecor = game?.farmDecor ?? [];
  const farmPlots = game?.farmPlots;
  const orchardTrees = game?.orchardTrees;
  const animalProducts = game?.animalProducts;
  const pond = game?.pond;

  useEffect(() => {
    if (!selectedSeedId || !seeds.some((seed) => seed.id === selectedSeedId)) {
      setSelectedSeedId(seeds[0]?.id ?? '');
    }
  }, [seeds, selectedSeedId]);

  return (
    <div className="grid gap-5">
      <WeatherBanner />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card title="Farm Overview">
          <div className="mb-4 grid gap-3 rounded-2xl bg-cream p-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block text-xs font-black uppercase tracking-wide text-ink/60">
              Seed to plant
              <select
                value={selectedSeedId}
                onChange={(event) => setSelectedSeedId(event.target.value)}
                className="mt-2 w-full rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-sm font-black text-ink outline-none focus:border-berry"
              >
                {seeds.length === 0 && <option value="">No seeds available</option>}
                {seeds.map((seed) => (
                  <option key={seed.id} value={seed.id}>{seed.name} x{seed.quantity}</option>
                ))}
              </select>
            </label>
            <p className="text-xs font-bold text-ink/60">Harvest: 2 energy. Plant, orchard, animals: 1 energy.</p>
          </div>
          <FarmScene farmName={farmName} farmDecor={farmDecor} plots={farmPlots} seeds={seeds} selectedSeedId={selectedSeedId} orchardTrees={orchardTrees} animalProducts={animalProducts} pond={pond} onHarvest={handleHarvest} onPlant={handlePlant} onOrchardHarvest={handleOrchardHarvest} onAnimalCollect={handleAnimalCollect} onPondCollect={handlePondCollect} />
          <p className="mt-4 rounded-xl bg-cream p-4 text-sm font-bold text-ink/70" aria-live="polite">{farmStatus}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Button variant="secondary" onClick={() => onNavigate('inventory')}>Open Inventory</Button>
            <Button onClick={() => onNavigate('gacha')}>Pull Banner</Button>
            <Button variant="secondary" onClick={() => onNavigate('mini-games')}>Mini Games</Button>
            <Button variant="ghost" onClick={() => onNavigate('trading')}>Trade Items</Button>
          </div>
        </Card>

        <Card title="Daily Tasks">
          <div className="grid gap-3">
            {quests.map((quest) => (
              <div key={quest.id} className="rounded-xl border-2 border-ink/10 bg-cream p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black">{quest.title}</h3>
                  <span className="rounded-full bg-sun px-3 py-1 text-xs font-black">{quest.progress}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink/70">Reward: {quest.reward}</p>
                  <Button type="button" variant={quest.claimed ? 'ghost' : 'secondary'} disabled={!quest.completed || quest.claimed} onClick={() => claimQuest(quest.id)}>
                    {quest.claimed ? 'Claimed' : quest.completed ? 'Claim' : 'Working'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Active AniPals">
        <div className="grid gap-4 md:grid-cols-3">
          {anipals.map((pal) => (
            <AniPalTreatCard key={pal.id} pal={pal} treats={treats} onGiveTreat={giveTreat} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function AniPalTreatCard({
  pal,
  treats,
  onGiveTreat,
}: {
  pal: GameState['anipals'][number];
  treats: GameState['inventory'];
  onGiveTreat: (aniPalId: string, treatId?: string) => void;
}) {
  const [selectedTreatId, setSelectedTreatId] = useState(treats[0]?.id ?? '');

  useEffect(() => {
    if (!selectedTreatId || !treats.some((treat) => treat.id === selectedTreatId)) {
      setSelectedTreatId(treats[0]?.id ?? '');
    }
  }, [selectedTreatId, treats]);

  return (
    <article className="rounded-2xl border-2 border-ink/10 bg-white p-4 shadow-pixel">
      <div className="flex items-center gap-4">
        <PixelAvatar name={pal.name} palette={pal.palette} species={pal.species} />
        <div>
          <h3 className="text-lg font-black">{pal.name}</h3>
          <p className="text-sm font-bold text-ink/70">{pal.species} - {pal.role}</p>
          <p className="mt-1 text-xs font-black text-berry">Lv {pal.level} / {pal.mood}</p>
        </div>
      </div>
      {pal.activeBoost && <p className="mt-3 rounded-xl bg-cream p-3 text-xs font-black text-ink/70">Boost: {pal.activeBoost}</p>}
      <label className="mt-4 block text-xs font-black uppercase tracking-wide text-ink/60">
        Treat
        <select
          value={selectedTreatId}
          onChange={(event) => setSelectedTreatId(event.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-ink/10 bg-cream px-3 py-2 text-sm font-black text-ink outline-none focus:border-berry"
        >
          {treats.length === 0 && <option value="">No treats available</option>}
          {treats.map((treat) => (
            <option key={treat.id} value={treat.id}>{treat.name} x{treat.quantity}</option>
          ))}
        </select>
      </label>
      <Button type="button" variant="secondary" className="mt-4 w-full" disabled={!selectedTreatId} onClick={() => onGiveTreat(pal.id, selectedTreatId)}>
        Feed Selected Treat
      </Button>
    </article>
  );
}

// Farm scene

function FarmScene({
  farmName,
  farmDecor,
  plots,
  seeds,
  selectedSeedId,
  orchardTrees,
  animalProducts,
  pond,
  onHarvest,
  onPlant,
  onOrchardHarvest,
  onAnimalCollect,
  onPondCollect,
}: {
  farmName: string;
  farmDecor: string[];
  plots?: FarmPlotType[];
  seeds: InventoryItem[];
  selectedSeedId: string;
  orchardTrees?: OrchardTree[];
  animalProducts?: AnimalProduct[];
  pond?: PondStatus;
  onHarvest: (plotIndex: number) => void;
  onPlant: (plotIndex: number, seedId?: string) => void;
  onOrchardHarvest: (treeIndex: number) => void;
  onAnimalCollect: (animalIndex: number) => void;
  onPondCollect: () => void;
}) {
  const pondReady = pond?.state !== 'RESTING';
  const pondLabel = pondReady ? 'Ready: fish, coins, energy' : `Resting: ${pond?.secondsUntilReady ?? 0}s`;
  const cropTiles = plots ?? [
    'rice-grain', 'carrots', 'wheat', 'moon-turnip',
    'star-melon', 'cloud-cotton', 'rice-grain', 'wheat',
    'carrots', 'moon-turnip', 'cloud-cotton', 'star-melon',
  ].map((crop, plotIndex) => ({ crop, plotIndex, state: 'READY' as const }));
  const treeTiles = orchardTrees ?? Array.from({ length: 8 }).map((_, treeIndex) => ({
    treeIndex,
    fruit: ['apples', 'peaches', 'oranges', 'pears'][treeIndex % 4] as OrchardTree['fruit'],
    state: 'READY' as const,
    readyAt: Date.now(),
    secondsUntilReady: 0,
  }));
  const animals = animalProducts ?? [
    { animalIndex: 0, animal: 'cow', product: 'Milk', state: 'READY', readyAt: Date.now(), secondsUntilReady: 0 },
    { animalIndex: 1, animal: 'chicken', product: 'Eggs', state: 'READY', readyAt: Date.now(), secondsUntilReady: 0 },
    { animalIndex: 2, animal: 'sheep', product: 'Wool', state: 'READY', readyAt: Date.now(), secondsUntilReady: 0 },
    { animalIndex: 3, animal: 'pig', product: 'Truffles', state: 'READY', readyAt: Date.now(), secondsUntilReady: 0 },
  ] as AnimalProduct[];
  const selectedSeed = seeds.find((seed) => seed.id === selectedSeedId);
  const hasLantern = farmDecor.some((decor) => decor.toLowerCase().includes('lantern'));
  const hasFence = farmDecor.some((decor) => decor.toLowerCase().includes('fence'));

  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-pixel"
      style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #b8e4a0 40%, #6dbf67 100%)' }}>

      {/* Sky with clouds */}
      <div className="relative h-16 px-4 pt-3">
        <Cloud x={8} />
        <Cloud x={52} delay={1.2} />
        <Cloud x={76} delay={0.6} small />
        {/* Sun */}
        <div className="absolute right-6 top-2 h-10 w-10 rounded-full shadow-lg"
          style={{ background: 'radial-gradient(circle, #ffe066 60%, #fbbf24 100%)', boxShadow: '0 0 16px 4px #ffe06688' }} />
        {/* Farm name */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border-2 border-white/80 bg-white/70 px-4 py-1">
          <span className="text-xs font-black text-amber-900">{farmName}</span>
        </div>
        {hasLantern && (
          <div className="absolute bottom-0 left-5 h-8 w-5 rounded-t-full border-2 border-amber-800 bg-cyan-200 shadow-pixel">
            <span className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-sun" />
          </div>
        )}
      </div>

      {/* Ground layer */}
      <div className="px-3 pb-3">
        {hasFence && <div className="mb-2 h-3 rounded bg-pink-300 shadow-pixel" />}
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">

          {/* LEFT COLUMN */}
          <div className="grid gap-3">

            {/* Farmhouse */}
            <div className="relative flex justify-center">
              <FarmHouseSVG />
            </div>

            {/* Crop field */}
            <div className="rounded-xl border-2 border-amber-700/40 p-2"
              style={{ background: 'linear-gradient(180deg, #c8a06a 0%, #a0724a 100%)' }}>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-xs font-black text-amber-100">Crop Fields</span>
                <span className="rounded-full bg-amber-900/60 px-2 py-0.5 text-xs font-black text-amber-100">12 plots</span>
              </div>
              {/* Tilled rows */}
              <div className="grid grid-cols-4 gap-1.5">
                {cropTiles.map((plot) => (
                  <FarmPlot key={plot.plotIndex} plot={plot} selectedSeed={selectedSeed} onHarvest={onHarvest} onPlant={onPlant} />
                ))}
              </div>
            </div>

            {/* Orchard row */}
            <div className="rounded-xl border-2 border-green-700/40 p-2"
              style={{ background: 'linear-gradient(180deg, #a8d870 0%, #7cbf4a 100%)' }}>
              <div className="mb-1.5 flex items-center justify-between px-1 text-xs font-black text-green-900">
                <span>Orchard</span>
                <span className="rounded-full bg-green-900/15 px-2 py-0.5">tap fruit</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {treeTiles.map((tree) => (
                  <PixelTree key={tree.treeIndex} tree={tree} onHarvest={onOrchardHarvest} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="grid gap-3">

            {/* Barn */}
            <BarnSVG />

            {/* Animal pen */}
            <div className="rounded-xl border-2 border-amber-700/40 p-2"
              style={{ background: '#e8d5a0' }}>
              <div className="mb-1.5 flex items-center justify-between px-1 text-xs font-black text-amber-900">
                <span>Animal Pen</span>
                <span className="rounded-full bg-amber-900/15 px-2 py-0.5">tap products</span>
              </div>
              {/* Wooden fence perimeter */}
              <div className="rounded-lg border-4 p-2"
                style={{ borderColor: '#8B5E3C', background: '#c8b480' }}>
                <div className="grid grid-cols-2 gap-2">
                  <AnimalButton animal={animals[0]} onCollect={onAnimalCollect}><PixelCow /></AnimalButton>
                  <AnimalButton animal={animals[1]} onCollect={onAnimalCollect}><PixelChicken /></AnimalButton>
                  <AnimalButton animal={animals[2]} onCollect={onAnimalCollect}><PixelSheep /></AnimalButton>
                  <AnimalButton animal={animals[3]} onCollect={onAnimalCollect}><PixelPig /></AnimalButton>
                </div>
              </div>
            </div>

            {/* Pond */}
            <button
              type="button"
              onClick={onPondCollect}
              disabled={!pondReady}
              className="rounded-xl border-2 border-blue-400/60 p-2 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(160deg, #60b8e0 0%, #2980b9 100%)' }}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-xs font-black text-white">Pond</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-black text-blue-700">{pondLabel}</span>
              </div>
              <PondSVG />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

// Cloud

function Cloud({ x, delay = 0, small = false }: { x: number; delay?: number; small?: boolean }) {
  return (
    <div
      className="absolute top-1"
      style={{
        left: `${x}%`,
        animation: `drift ${small ? 18 : 14}s ease-in-out ${delay}s infinite alternate`,
      }}
    >
      <style>{`@keyframes drift { from { transform: translateX(0); } to { transform: translateX(12px); } }`}</style>
      <div className="relative" style={{ opacity: 0.92 }}>
        <div className={`rounded-full bg-white ${small ? 'h-4 w-10' : 'h-5 w-16'}`} style={{ boxShadow: '0 2px 8px #fff8' }} />
        <div className={`absolute ${small ? '-top-2 left-2 h-4 w-4' : '-top-3 left-3 h-6 w-6'} rounded-full bg-white`} />
        <div className={`absolute ${small ? '-top-1 left-5 h-3 w-5' : '-top-2 left-8 h-5 w-8'} rounded-full bg-white`} />
      </div>
    </div>
  );
}

// Farmhouse SVG

function FarmHouseSVG() {
  return (
    <svg viewBox="0 0 220 110" className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="110" cy="106" rx="90" ry="6" fill="#00000022" />

      {/* Main house body */}
      <rect x="30" y="52" width="160" height="58" rx="2" fill="#f5f0e8" />
      {/* Side wall shading */}
      <rect x="160" y="52" width="30" height="58" rx="2" fill="#e8e0cc" />

      {/* Roof */}
      <polygon points="20,55 110,8 200,55" fill="#b22222" />
      <polygon points="20,55 110,8 200,55" fill="none" stroke="#8b1a1a" strokeWidth="1.5" />
      {/* Roof ridge cap */}
      <rect x="106" y="7" width="8" height="6" rx="1" fill="#8b1a1a" />
      {/* Roof overhang shadow */}
      <polygon points="20,55 200,55 200,60 20,60" fill="#00000018" />

      {/* Porch base */}
      <rect x="55" y="88" width="110" height="22" rx="2" fill="#c8a06a" />
      <rect x="55" y="88" width="110" height="4" fill="#a07840" />
      {/* Porch posts */}
      <rect x="62" y="70" width="6" height="22" rx="1" fill="#8B5E3C" />
      <rect x="152" y="70" width="6" height="22" rx="1" fill="#8B5E3C" />
      {/* Porch rail */}
      <rect x="62" y="84" width="96" height="3" rx="1" fill="#8B5E3C" />
      {/* Porch steps */}
      <rect x="95" y="108" width="30" height="4" rx="1" fill="#a07840" />

      {/* Front door */}
      <rect x="98" y="68" width="24" height="30" rx="2" fill="#6b3a2a" />
      <rect x="100" y="70" width="20" height="26" rx="1" fill="#8b5e3c" />
      {/* Door panels */}
      <rect x="102" y="72" width="7" height="10" rx="1" fill="#a07040" />
      <rect x="111" y="72" width="7" height="10" rx="1" fill="#a07040" />
      <rect x="102" y="84" width="7" height="8" rx="1" fill="#a07040" />
      <rect x="111" y="84" width="7" height="8" rx="1" fill="#a07040" />
      {/* Door knob */}
      <circle cx="116" cy="84" r="2" fill="#e8c870" />

      {/* Left window */}
      <rect x="42" y="62" width="30" height="22" rx="2" fill="#4a90d9" />
      <rect x="44" y="64" width="26" height="18" rx="1" fill="#7ab8f5" />
      <rect x="44" y="64" width="26" height="1" fill="#2060a0" />
      <rect x="57" y="64" width="1" height="18" fill="#2060a0" />
      <rect x="44" y="73" width="26" height="1" fill="#2060a0" />
      {/* Window reflection */}
      <rect x="46" y="66" width="4" height="6" rx="1" fill="#ffffff55" />

      {/* Right window */}
      <rect x="148" y="62" width="30" height="22" rx="2" fill="#4a90d9" />
      <rect x="150" y="64" width="26" height="18" rx="1" fill="#7ab8f5" />
      <rect x="150" y="64" width="26" height="1" fill="#2060a0" />
      <rect x="163" y="64" width="1" height="18" fill="#2060a0" />
      <rect x="150" y="73" width="26" height="1" fill="#2060a0" />
      <rect x="152" y="66" width="4" height="6" rx="1" fill="#ffffff55" />

      {/* Attic window */}
      <rect x="94" y="24" width="22" height="18" rx="2" fill="#4a90d9" />
      <rect x="96" y="26" width="18" height="14" rx="1" fill="#7ab8f5" />
      <rect x="105" y="26" width="1" height="14" fill="#2060a0" />
      <rect x="96" y="33" width="18" height="1" fill="#2060a0" />

      {/* Chimney */}
      <rect x="148" y="10" width="14" height="28" rx="1" fill="#8b4513" />
      <rect x="146" y="8" width="18" height="5" rx="1" fill="#6b3010" />
      {/* Smoke */}
      <circle cx="155" cy="5" r="3" fill="#cccccc88" />
      <circle cx="158" cy="2" r="2" fill="#cccccc55" />

      {/* Flower pots on porch */}
      <rect x="72" y="82" width="8" height="6" rx="1" fill="#c8602a" />
      <circle cx="76" cy="80" r="5" fill="#e85050" />
      <circle cx="74" cy="78" r="3" fill="#f07070" />

      <rect x="140" y="82" width="8" height="6" rx="1" fill="#c8602a" />
      <circle cx="144" cy="80" r="5" fill="#f0a030" />
      <circle cx="142" cy="78" r="3" fill="#f0c060" />
    </svg>
  );
}

// Barn SVG

function BarnSVG() {
  return (
    <div className="rounded-xl border-2 border-red-800/40 p-2"
      style={{ background: 'linear-gradient(180deg, #c8502a 0%, #a03818 100%)' }}>
      <div className="mb-1 px-1 text-xs font-black text-red-100">Barn</div>
      <svg viewBox="0 0 160 100" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse cx="80" cy="97" rx="65" ry="5" fill="#00000030" />

        {/* Barn body */}
        <rect x="10" y="42" width="140" height="58" rx="2" fill="#c0392b" />
        <rect x="110" y="42" width="40" height="58" rx="2" fill="#a93226" />

        {/* Roof */}
        <polygon points="5,45 80,5 155,45" fill="#8b1a1a" />
        <polygon points="5,45 80,5 155,45" fill="none" stroke="#6b1010" strokeWidth="1" />
        {/* Roof planks */}
        {[15, 30, 45, 60, 75, 90, 105, 120, 135].map((x, i) => (
          <line key={i} x1={x} y1={45} x2={80 - (x - 80) * 0.1} y2={8} stroke="#6b1010" strokeWidth="0.8" opacity="0.5" />
        ))}
        {/* Ridge */}
        <rect x="76" y="4" width="8" height="5" rx="1" fill="#5a0e0e" />

        {/* Main barn doors (double) */}
        <rect x="44" y="56" width="30" height="44" rx="1" fill="#5c2a00" />
        <rect x="46" y="58" width="13" height="40" rx="1" fill="#7a3a10" />
        <rect x="61" y="58" width="13" height="40" rx="1" fill="#6b3008" />
        {/* Door X brace */}
        <line x1="46" y1="58" x2="59" y2="98" stroke="#4a1e00" strokeWidth="1.5" />
        <line x1="59" y1="58" x2="46" y2="98" stroke="#4a1e00" strokeWidth="1.5" />
        <line x1="61" y1="58" x2="74" y2="98" stroke="#4a1e00" strokeWidth="1.5" />
        <line x1="74" y1="58" x2="61" y2="98" stroke="#4a1e00" strokeWidth="1.5" />
        {/* Door handles */}
        <circle cx="60" cy="78" r="2" fill="#e8c030" />
        <circle cx="62" cy="78" r="2" fill="#e8c030" />

        {/* Hayloft window */}
        <rect x="64" y="16" width="32" height="22" rx="2" fill="#2060a0" />
        <rect x="66" y="18" width="28" height="18" rx="1" fill="#4a90d9" />
        {/* Window arch */}
        <path d="M 66 26 Q 80 14 94 26" fill="#4a90d9" stroke="#2060a0" strokeWidth="1" />
        <rect x="80" y="18" width="1" height="18" fill="#2060a0" />
        <rect x="66" y="27" width="28" height="1" fill="#2060a0" />
        {/* Hay visible */}
        <rect x="68" y="28" width="24" height="8" rx="1" fill="#e8c050" opacity="0.8" />

        {/* Side window */}
        <rect x="118" y="55" width="22" height="16" rx="1" fill="#4a90d9" />
        <rect x="119" y="56" width="20" height="14" rx="1" fill="#7ab8f5" />
        <rect x="129" y="56" width="1" height="14" fill="#2060a0" />
        <rect x="119" y="63" width="20" height="1" fill="#2060a0" />

        {/* Weather vane */}
        <line x1="80" y1="4" x2="80" y2="-2" stroke="#888" strokeWidth="1.5" />
        <circle cx="77" cy="0" r="2" fill="#f8fafc" />
        <path d="M78,-1 L84,1 L78,3 Z" fill="#f59e0b" />

        {/* Fence in front */}
        {[10, 28, 46, 64, 82, 100, 118, 136].map((x, i) => (
          <rect key={i} x={x} y="94" width="5" height="8" rx="1" fill="#8B5E3C" />
        ))}
        <rect x="10" y="97" width="130" height="2.5" rx="1" fill="#8B5E3C" />
      </svg>
    </div>
  );
}

// Pixel tree

function PixelTree({ tree, onHarvest }: { tree: OrchardTree; onHarvest: (treeIndex: number) => void }) {
  const ready = tree.state === 'READY';
  const fruitName = tree.fruit[0].toUpperCase() + tree.fruit.slice(1);
  const colors: Record<OrchardTree['fruit'], { trunk: string; canopy: string; fruit: string }> = {
    apples: { trunk: '#8B5E3C', canopy: '#3d8c2f', fruit: '#e53e3e' },
    peaches: { trunk: '#8B5E3C', canopy: '#4a9e35', fruit: '#f9a8a8' },
    oranges: { trunk: '#7a5230', canopy: '#2d7a24', fruit: '#f97316' },
    pears: { trunk: '#8B5E3C', canopy: '#4a9e35', fruit: '#fbbf24' },
  };
  const { trunk, canopy, fruit } = colors[tree.fruit];

  return (
    <button
      type="button"
      onClick={() => onHarvest(tree.treeIndex)}
      disabled={!ready}
      className="relative rounded-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      aria-label={ready ? `Harvest ${fruitName}` : `${fruitName} ready in ${tree.secondsUntilReady} seconds`}
      title={ready ? `Harvest ${fruitName}: 1 energy` : `${fruitName} ready in ${tree.secondsUntilReady} seconds`}
    >
      <svg viewBox="0 0 36 44" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse cx="18" cy="42" rx="10" ry="3" fill="#00000022" />
        {/* Trunk */}
        <rect x="14" y="26" width="8" height="16" rx="2" fill={trunk} />
        {/* Root bulges */}
        <rect x="11" y="38" width="5" height="4" rx="2" fill={trunk} />
        <rect x="20" y="38" width="5" height="4" rx="2" fill={trunk} />
        {/* Canopy layers */}
        <circle cx="18" cy="22" r="13" fill={canopy} />
        <circle cx="18" cy="16" r="10" fill={canopy} />
        {/* Highlight */}
        <circle cx="13" cy="13" r="4" fill="#ffffff28" />
        {ready ? (
          <>
            <circle cx="12" cy="20" r="3" fill={fruit} />
            <circle cx="22" cy="18" r="3" fill={fruit} />
            <circle cx="18" cy="26" r="2.5" fill={fruit} />
            <circle cx="11" cy="19" r="1" fill="#ffffff88" />
            <circle cx="21" cy="17" r="1" fill="#ffffff88" />
          </>
        ) : (
          <text x="18" y="22" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">{tree.secondsUntilReady}s</text>
        )}
      </svg>
      <span className="absolute inset-x-0 bottom-0 rounded bg-green-950/60 px-1 py-0.5 text-[9px] font-black leading-none text-white">
        {ready ? fruitName : `${tree.secondsUntilReady}s`}
      </span>
    </button>
  );
}

function AnimalButton({
  animal,
  onCollect,
  children,
}: {
  animal: AnimalProduct;
  onCollect: (animalIndex: number) => void;
  children: ReactNode;
}) {
  const ready = animal.state === 'READY';

  return (
    <button
      type="button"
      onClick={() => onCollect(animal.animalIndex)}
      disabled={!ready}
      className="relative rounded-lg bg-white/25 p-1 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      aria-label={ready ? `Collect ${animal.product}` : `${animal.product} ready in ${animal.secondsUntilReady} seconds`}
      title={ready ? `Collect ${animal.product}: 1 energy` : `${animal.product} ready in ${animal.secondsUntilReady} seconds`}
    >
      {children}
      <span className="absolute inset-x-1 bottom-1 rounded bg-amber-950/60 px-1 py-0.5 text-[9px] font-black leading-none text-white">
        {ready ? animal.product : `${animal.secondsUntilReady}s`}
      </span>
    </button>
  );
}

// Farm plot

function FarmPlot({
  plot,
  selectedSeed,
  onHarvest,
  onPlant,
}: {
  plot: FarmPlotType;
  selectedSeed?: InventoryItem;
  onHarvest: (i: number) => void;
  onPlant: (i: number, seedId?: string) => void;
}) {
  const harvested = plot.state === 'CLEARED';
  const growing = plot.state === 'PLANTED';
  const secondsLeft = growing && plot.readyAt ? Math.max(1, Math.ceil((plot.readyAt - Date.now()) / 1000)) : 0;
  const cropName = cropLabels[plot.crop] ?? plot.crop;
  const label = harvested
    ? `Plant ${selectedSeed?.name ?? 'selected seed'}`
    : growing
      ? `${cropName} growing, ${secondsLeft} seconds left`
      : `Harvest ${cropName}`;

  return (
    <button
      type="button"
      onClick={() => (harvested ? onPlant(plot.plotIndex, selectedSeed?.id) : onHarvest(plot.plotIndex))}
      className="relative aspect-square overflow-hidden rounded-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
      style={{ background: '#7a4a20' }}
      aria-label={label}
      title={label}
    >
      {/* Tilled soil rows */}
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="#8B5E3C" />
        {[6, 14, 22, 30, 38].map((y, i) => (
          <rect key={i} x="0" y={y} width="40" height="3" rx="1" fill="#6b4020" />
        ))}
        {/* Soil moisture shine */}
        <rect x="3" y="7" width="34" height="1" rx="0.5" fill="#a07040" opacity="0.4" />
        <rect x="3" y="15" width="34" height="1" rx="0.5" fill="#a07040" opacity="0.4" />
        <rect x="3" y="23" width="34" height="1" rx="0.5" fill="#a07040" opacity="0.4" />

        {!harvested && !growing && plot.crop === 'rice-grain' && (
          <>
            {[8, 16, 24, 32].map((x, i) => (
              <g key={i}>
                <line x1={x} y1="33" x2={x + 1} y2="12" stroke="#65a30d" strokeWidth="1.4" />
                <ellipse cx={x - 1} cy="17" rx="2.2" ry="4" fill="#fef3c7" />
                <ellipse cx={x + 3} cy="20" rx="2.2" ry="4" fill="#fde68a" />
                <ellipse cx={x} cy="24" rx="2.2" ry="4" fill="#fef08a" />
              </g>
            ))}
          </>
        )}
        {!harvested && !growing && plot.crop === 'carrots' && (
          <>
            {[8, 20, 32].map((x, i) => (
              <g key={i}>
                <path d={`M${x},28 Q${x - 3},18 ${x},12 Q${x + 3},18 ${x},28`} fill="#f97316" />
                <line x1={x} y1="12" x2={x - 3} y2="7" stroke="#22c55e" strokeWidth="1.5" />
                <line x1={x} y1="12" x2={x + 3} y2="7" stroke="#22c55e" strokeWidth="1.5" />
                <line x1={x} y1="12" x2={x} y2="6" stroke="#22c55e" strokeWidth="1.5" />
              </g>
            ))}
          </>
        )}
        {!harvested && !growing && plot.crop === 'wheat' && (
          <>
            {[7, 15, 23, 31].map((x, i) => (
              <g key={i}>
                {/* Stalk */}
                <line x1={x + 2} y1="34" x2={x + 2} y2="14" stroke="#d4a22a" strokeWidth="1.5" />
                {/* Wheat head */}
                <ellipse cx={x + 2} cy="11" rx="3" ry="6" fill="#e8c040" />
                <ellipse cx={x - 1} cy="14" rx="2" ry="4" fill="#d4a830" />
                <ellipse cx={x + 5} cy="14" rx="2" ry="4" fill="#d4a830" />
                {/* Grain dots */}
                <circle cx={x + 2} cy="9" r="1" fill="#c49020" />
                <circle cx={x + 2} cy="12" r="1" fill="#c49020" />
              </g>
            ))}
          </>
        )}
        {!harvested && !growing && plot.crop === 'moon-turnip' && (
          <>
            {[12, 28].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy="25" r="7" fill="#a78bfa" />
                <path d={`M${x},19 Q${x - 4},11 ${x},8 Q${x + 4},11 ${x},19`} fill="#86efac" />
                <circle cx={x - 2} cy="23" r="1.5" fill="#ede9fe" />
              </g>
            ))}
          </>
        )}
        {!harvested && !growing && plot.crop === 'star-melon' && (
          <>
            {[12, 28].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy="24" r="7" fill="#facc15" />
                <path d={`M${x - 4},20 L${x},12 L${x + 4},20 L${x + 11},21 L${x + 5},26 L${x + 7},34 L${x},29 L${x - 7},34 L${x - 5},26 L${x - 11},21 Z`} fill="#fde047" opacity="0.65" />
                <path d={`M${x},17 Q${x - 2},12 ${x + 4},10`} stroke="#16a34a" strokeWidth="1.5" fill="none" />
              </g>
            ))}
          </>
        )}
        {!harvested && !growing && plot.crop === 'cloud-cotton' && (
          <>
            {[10, 22, 32].map((x, i) => (
              <g key={i}>
                <line x1={x} y1="34" x2={x} y2="18" stroke="#78716c" strokeWidth="1.5" />
                <circle cx={x - 3} cy="16" r="4" fill="#f8fafc" />
                <circle cx={x + 2} cy="14" r="5" fill="#e2e8f0" />
                <circle cx={x + 5} cy="19" r="4" fill="#f8fafc" />
              </g>
            ))}
          </>
        )}
        {growing && (
          <>
            <circle cx="20" cy="22" r="8" fill="#86efac" opacity="0.7" />
            <text x="20" y="14" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">{secondsLeft}s</text>
          </>
        )}
        {harvested && (
          <text x="20" y="23" textAnchor="middle" fontSize="7" fill="#ffffffcc" fontWeight="bold">Plant</text>
        )}
      </svg>
      <span className="absolute inset-x-1 bottom-1 rounded bg-black/45 px-1 py-0.5 text-[9px] font-black leading-none text-white">
        {harvested ? (selectedSeed?.name.replace(' Seeds', '') ?? 'No seed') : growing ? `${secondsLeft}s` : cropName}
      </span>
    </button>
  );
}

// Pond SVG

function PondSVG() {
  return (
    <svg viewBox="0 0 160 70" className="w-full rounded-lg" xmlns="http://www.w3.org/2000/svg">
      {/* Pond water */}
      <ellipse cx="80" cy="40" rx="72" ry="28" fill="#1a6ea8" />
      <ellipse cx="80" cy="40" rx="72" ry="28" fill="url(#pondGrad)" />
      <defs>
        <radialGradient id="pondGrad" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#4fb8e8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0e4a70" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Lily pads */}
      <ellipse cx="35" cy="48" rx="10" ry="7" fill="#2d8a3a" />
      <path d="M35,48 L35,41" stroke="#2d8a3a" strokeWidth="1" />
      <circle cx="35" cy="44" r="3" fill="#f472b6" />

      <ellipse cx="125" cy="44" rx="9" ry="6" fill="#3a9e48" />
      <path d="M125,44 L125,38" stroke="#3a9e48" strokeWidth="1" />
      <circle cx="125" cy="40" r="2.5" fill="#fbbf24" />

      {/* Fish */}
      <g transform="translate(60, 38)">
        <ellipse cx="0" cy="0" rx="12" ry="5" fill="#f97316" />
        <path d="M12,0 L18,-5 L18,5 Z" fill="#ea580c" />
        <circle cx="-6" cy="-1" r="2" fill="#fff" />
        <circle cx="-6" cy="-1" r="1" fill="#000" />
        <path d="M-4,3 Q0,6 4,3" stroke="#c2410c" strokeWidth="1" fill="none" />
      </g>

      <g transform="translate(100, 50) scale(-1,1)">
        <ellipse cx="0" cy="0" rx="9" ry="4" fill="#60a5fa" />
        <path d="M9,0 L14,-4 L14,4 Z" fill="#3b82f6" />
        <circle cx="-4" cy="-1" r="1.5" fill="#fff" />
        <circle cx="-4" cy="-1" r="0.8" fill="#000" />
      </g>

      {/* Water ripples */}
      <ellipse cx="80" cy="30" rx="20" ry="4" fill="none" stroke="#ffffff30" strokeWidth="1" />
      <ellipse cx="80" cy="30" rx="35" ry="7" fill="none" stroke="#ffffff18" strokeWidth="1" />

      {/* Reeds */}
      <line x1="18" y1="50" x2="16" y2="20" stroke="#6b7c2a" strokeWidth="2" />
      <ellipse cx="16" cy="19" rx="3" ry="7" fill="#4a5a18" />
      <line x1="24" y1="52" x2="23" y2="24" stroke="#6b7c2a" strokeWidth="2" />
      <ellipse cx="23" cy="23" rx="2.5" ry="6" fill="#5a6a22" />

      <line x1="142" y1="48" x2="144" y2="18" stroke="#6b7c2a" strokeWidth="2" />
      <ellipse cx="144" cy="17" rx="3" ry="7" fill="#4a5a18" />

      {/* Shore rocks */}
      <ellipse cx="15" cy="55" rx="7" ry="4" fill="#8d9e8a" />
      <ellipse cx="145" cy="58" rx="6" ry="3.5" fill="#8d9e8a" />
      <ellipse cx="80" cy="66" rx="10" ry="4" fill="#a0b09a" />
    </svg>
  );
}

// Pixel animals

function PixelCow() {
  return (
    <svg viewBox="0 0 50 44" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="42" rx="16" ry="3" fill="#00000022" />
      {/* Body */}
      <ellipse cx="25" cy="28" rx="16" ry="10" fill="#f5f5f0" />
      {/* Black spots */}
      <ellipse cx="20" cy="26" rx="5" ry="4" fill="#333" />
      <ellipse cx="32" cy="30" rx="4" ry="3" fill="#333" />
      {/* Head */}
      <ellipse cx="34" cy="20" rx="9" ry="7" fill="#f5f5f0" />
      {/* Snout */}
      <ellipse cx="40" cy="22" rx="5" ry="4" fill="#f4a0a0" />
      <circle cx="38" cy="22" r="1.2" fill="#c06060" />
      <circle cx="42" cy="22" r="1.2" fill="#c06060" />
      {/* Eye */}
      <circle cx="36" cy="17" r="2" fill="#333" />
      <circle cx="35" cy="16" r="0.8" fill="#fff" />
      {/* Ear */}
      <ellipse cx="27" cy="14" rx="4" ry="3" fill="#f5f5f0" />
      <ellipse cx="27" cy="14" rx="2" ry="1.5" fill="#f4a0a0" />
      {/* Horns */}
      <path d="M28,12 Q24,6 20,8" stroke="#c8a060" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Legs */}
      <rect x="12" y="36" width="5" height="8" rx="2" fill="#e0e0da" />
      <rect x="20" y="37" width="5" height="7" rx="2" fill="#e0e0da" />
      <rect x="28" y="37" width="5" height="7" rx="2" fill="#e0e0da" />
      <rect x="35" y="36" width="5" height="8" rx="2" fill="#e0e0da" />
      {/* Hooves */}
      <rect x="12" y="42" width="5" height="3" rx="1" fill="#555" />
      <rect x="20" y="42" width="5" height="3" rx="1" fill="#555" />
      <rect x="28" y="42" width="5" height="3" rx="1" fill="#555" />
      <rect x="35" y="42" width="5" height="3" rx="1" fill="#555" />
      {/* Tail */}
      <path d="M10,26 Q4,22 6,30" stroke="#ccc" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="30" r="2" fill="#ccc" />
      {/* Udder */}
      <ellipse cx="22" cy="37" rx="5" ry="3" fill="#f4a0a0" />
    </svg>
  );
}

function PixelChicken() {
  return (
    <svg viewBox="0 0 40 44" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="42" rx="12" ry="3" fill="#00000022" />
      {/* Body */}
      <ellipse cx="20" cy="30" rx="12" ry="10" fill="#fef3c7" />
      {/* Wing */}
      <ellipse cx="14" cy="30" rx="7" ry="5" fill="#fde68a" />
      {/* Head */}
      <circle cx="28" cy="18" r="8" fill="#fef3c7" />
      {/* Comb */}
      <path d="M26,10 Q28,6 30,10 Q32,6 34,10" stroke="#dc2626" strokeWidth="2" fill="none" />
      <circle cx="27" cy="10" r="2" fill="#dc2626" />
      <circle cx="31" cy="9" r="2" fill="#dc2626" />
      {/* Wattle */}
      <ellipse cx="34" cy="22" rx="3" ry="4" fill="#dc2626" />
      {/* Beak */}
      <path d="M34,17 L40,19 L34,21 Z" fill="#f59e0b" />
      {/* Eye */}
      <circle cx="30" cy="16" r="2.5" fill="#fff" />
      <circle cx="30" cy="16" r="1.5" fill="#333" />
      <circle cx="29" cy="15" r="0.6" fill="#fff" />
      {/* Tail feathers */}
      <path d="M8,26 Q2,18 4,26 Q0,22 4,30" fill="#fbbf24" />
      {/* Legs */}
      <line x1="18" y1="40" x2="15" y2="44" stroke="#f59e0b" strokeWidth="2.5" />
      <line x1="23" y1="40" x2="26" y2="44" stroke="#f59e0b" strokeWidth="2.5" />
      {/* Feet */}
      <line x1="15" y1="44" x2="11" y2="44" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="15" y1="44" x2="15" y2="46" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="26" y1="44" x2="30" y2="44" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="26" y1="44" x2="26" y2="46" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  );
}

function PixelSheep() {
  return (
    <svg viewBox="0 0 50 44" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="42" rx="16" ry="3" fill="#00000022" />
      {/* Fluffy wool body - multiple circles for fluff effect */}
      <circle cx="20" cy="28" r="10" fill="#f0ede8" />
      <circle cx="30" cy="27" r="9" fill="#ece9e4" />
      <circle cx="25" cy="24" r="8" fill="#f4f1ec" />
      <circle cx="16" cy="25" r="7" fill="#ece9e4" />
      <circle cx="34" cy="26" r="7" fill="#f0ede8" />
      <circle cx="25" cy="30" r="9" fill="#f4f1ec" />
      {/* Head */}
      <ellipse cx="37" cy="20" rx="8" ry="7" fill="#d4cfc8" />
      {/* Snout */}
      <ellipse cx="42" cy="22" rx="4" ry="3" fill="#c0b8b0" />
      <circle cx="41" cy="22" r="1" fill="#8a7a70" />
      <circle cx="43" cy="22" r="1" fill="#8a7a70" />
      {/* Eye */}
      <ellipse cx="38" cy="18" rx="2" ry="2.5" fill="#333" />
      <circle cx="37" cy="17" r="0.8" fill="#fff" />
      {/* Ear */}
      <ellipse cx="30" cy="14" rx="4" ry="3" fill="#d4cfc8" transform="rotate(-20,30,14)" />
      {/* Legs */}
      <rect x="13" y="37" width="5" height="7" rx="2" fill="#c0b8b0" />
      <rect x="21" y="37" width="5" height="7" rx="2" fill="#c0b8b0" />
      <rect x="29" y="37" width="5" height="7" rx="2" fill="#c0b8b0" />
      <rect x="37" y="37" width="5" height="7" rx="2" fill="#c0b8b0" />
      {/* Hooves */}
      <rect x="13" y="42" width="5" height="3" rx="1" fill="#5a5050" />
      <rect x="21" y="42" width="5" height="3" rx="1" fill="#5a5050" />
      <rect x="29" y="42" width="5" height="3" rx="1" fill="#5a5050" />
      <rect x="37" y="42" width="5" height="3" rx="1" fill="#5a5050" />
    </svg>
  );
}

function PixelPig() {
  return (
    <svg viewBox="0 0 50 44" className="w-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="42" rx="16" ry="3" fill="#00000022" />
      {/* Body */}
      <ellipse cx="24" cy="28" rx="16" ry="11" fill="#f9a8c0" />
      {/* Head */}
      <circle cx="36" cy="20" r="10" fill="#f9a8c0" />
      {/* Snout */}
      <ellipse cx="42" cy="22" rx="6" ry="5" fill="#f47090" />
      <circle cx="40" cy="22" r="1.5" fill="#c0405a" />
      <circle cx="44" cy="22" r="1.5" fill="#c0405a" />
      {/* Eye */}
      <circle cx="36" cy="16" r="2.5" fill="#fff" />
      <circle cx="36" cy="16" r="1.5" fill="#333" />
      <circle cx="35" cy="15" r="0.6" fill="#fff" />
      {/* Ear */}
      <path d="M28,11 Q26,4 32,8" fill="#f47090" stroke="#f47090" strokeWidth="1" />
      <path d="M38,11 Q42,4 44,10" fill="#f47090" stroke="#f47090" strokeWidth="1" />
      {/* Belly spot */}
      <ellipse cx="22" cy="30" rx="8" ry="5" fill="#fbc8d8" />
      {/* Legs */}
      <rect x="11" y="36" width="5" height="8" rx="2" fill="#f47090" />
      <rect x="19" y="37" width="5" height="7" rx="2" fill="#f47090" />
      <rect x="28" y="37" width="5" height="7" rx="2" fill="#f47090" />
      <rect x="36" y="36" width="5" height="8" rx="2" fill="#f47090" />
      {/* Hooves */}
      <rect x="11" y="42" width="5" height="3" rx="1" fill="#c04060" />
      <rect x="19" y="42" width="5" height="3" rx="1" fill="#c04060" />
      <rect x="28" y="42" width="5" height="3" rx="1" fill="#c04060" />
      <rect x="36" y="42" width="5" height="3" rx="1" fill="#c04060" />
      {/* Curly tail */}
      <path d="M9,26 Q4,22 6,28 Q4,32 8,30" stroke="#f47090" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
