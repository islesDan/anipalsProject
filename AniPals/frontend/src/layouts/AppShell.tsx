import { useEffect, useState, type ReactNode } from 'react';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { PixelAvatar } from '../components/PixelAvatar';
import { ResourceBar } from '../components/ResourceBar';
import { useMockGame } from '../hooks/useMockGame';
import { gameEvent, localGameService } from '../services/localGame';
import { clearSession } from '../services/session';
import type { GameState, PageId } from '../types/game';

type AppShellProps = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
};

const navItems: Array<{ id: PageId; label: string; icon: string }> = [
  { id: 'tutorial', label: 'Tutorial', icon: 'book' },
  { id: 'dashboard', label: 'Farm', icon: 'farm' },
  { id: 'inventory', label: 'Inventory', icon: 'crate' },
  { id: 'gacha', label: 'Gacha', icon: 'seed' },
  { id: 'mini-games', label: 'Mini Games', icon: 'cup' },
  { id: 'trading', label: 'Trading', icon: 'basket' },
  { id: 'friends', label: 'Friends', icon: 'profile' },
];

const buildLabel = 'UID/music fix 2026-05-31';
const legacyUidPattern = /^ANI-\d{4}$/;

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const { player: fallbackPlayer } = useMockGame();
  const [player, setPlayer] = useState(fallbackPlayer);
  const xpProgress = Math.min(100, Math.max(0, ((player.xp % 100) / 100) * 100));

  useEffect(() => {
    let mounted = true;

    async function syncPlayerFromStorage() {
      const next = await localGameService.state();
      if (mounted) setPlayer(next.player);
    }

    function syncPlayerFromEvent(event: Event) {
      const next = (event as CustomEvent<GameState>).detail;
      if (mounted && next?.player) setPlayer(next.player);
    }

    syncPlayerFromStorage();
    window.addEventListener(gameEvent, syncPlayerFromEvent);
    return () => {
      mounted = false;
      window.removeEventListener(gameEvent, syncPlayerFromEvent);
    };
  }, []);

  async function repairUid() {
    localStorage.removeItem('anipals.playerUid');
    const stored = localStorage.getItem('anipals.localGame.v1');
    if (stored) {
      try {
        const game = JSON.parse(stored);
        if (game?.player) game.player.uid = '';
        localStorage.setItem('anipals.localGame.v1', JSON.stringify(game));
      } catch {
        localStorage.removeItem('anipals.localGame.v1');
      }
    }

    const next = await localGameService.state();
    setPlayer(next.player);
  }

  function logout() {
    clearSession();
    onNavigate('login');
  }

  return (
    <main className="min-h-screen bg-cream pixel-grid text-ink">
      <div className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[260px_1fr] lg:p-6">
        <aside className="rounded-3xl border-4 border-white bg-white/80 p-4 shadow-soft lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="mb-6 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-meadow to-pond p-4 text-left text-white shadow-pixel"
          >
            <PixelAvatar name={player.name} palette="bg-sun" size="sm" />
            <span>
              <span className="block text-2xl font-black leading-none">AniPals</span>
              <span className="text-xs font-black uppercase tracking-wide text-white/80">Live Farm</span>
            </span>
          </button>

          <div className="mb-5 rounded-2xl border-2 border-ink/10 bg-cream p-4">
            <div className="mb-3 flex items-center gap-3">
              <FarmNavIcon icon="profile" active />
              <div>
                <div className="text-sm font-black">{player.name}</div>
                <div className="text-xs font-bold text-ink/60">{player.uid}</div>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-berry transition-all" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="mt-1 text-xs font-bold text-ink/60">
              Level {player.level} farmer - {player.xp % 100}/100 XP ({player.xp} total)
            </div>
            {legacyUidPattern.test(player.uid) && (
              <button
                type="button"
                onClick={repairUid}
                className="mt-3 rounded-xl border-2 border-berry bg-rose-50 px-3 py-2 text-xs font-black text-berry"
              >
                Repair UID
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-xl border-2 border-ink/10 bg-white px-3 py-2 text-xs font-black text-ink/70 transition hover:border-berry hover:text-berry"
            >
              Log out / Switch account
            </button>
            <div className="mt-2 text-[10px] font-black uppercase tracking-wide text-ink/40">{buildLabel}</div>
          </div>

          <nav className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-black transition hover:-translate-y-0.5 ${
                  activePage === item.id
                    ? 'border-berry bg-rose-50 text-berry shadow-pixel'
                    : 'border-transparent bg-white/70 text-ink hover:border-ink/10'
                }`}
              >
                <FarmNavIcon icon={item.icon} active={activePage === item.id} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="mb-5 rounded-3xl border-4 border-white bg-white/80 p-4 shadow-soft">
            <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-ink/60">Welcome back to</p>
                <h1 className="text-3xl font-black text-ink">{player.farmName}</h1>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3 text-sm font-black shadow-pixel">
                Notifications: 3 new messages
              </div>
            </div>
            <ResourceBar />
          </header>
          {children}
        </section>
      </div>
      <BackgroundMusic />
    </main>
  );
}

function FarmNavIcon({ icon, active = false }: { icon: string; active?: boolean }) {
  const base = active ? 'border-berry bg-sun' : 'border-ink/10 bg-cream';

  if (icon === 'book') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute left-1.5 top-1.5 h-5 w-3 rounded-sm bg-white shadow-[inset_-2px_0_0_#eab308]" />
        <span className="absolute right-1.5 top-1.5 h-5 w-3 rounded-sm bg-lime-200 shadow-[inset_2px_0_0_#eab308]" />
        <span className="absolute left-1/2 top-1.5 h-5 w-0.5 -translate-x-1/2 bg-amber-700" />
      </span>
    );
  }

  if (icon === 'farm') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute left-1 top-4 h-3.5 w-6 rounded-sm bg-red-500" />
        <span className="absolute left-0.5 top-3 h-0 w-0 border-x-[14px] border-b-[8px] border-x-transparent border-b-red-800" />
        <span className="absolute left-3 top-5 h-3 w-2 rounded-t bg-amber-100" />
        <span className="absolute right-1 top-1.5 h-3 w-1 rounded-full bg-green-700" />
      </span>
    );
  }

  if (icon === 'crate') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute inset-x-1.5 bottom-1.5 top-2 rounded bg-amber-600" />
        <span className="absolute left-2 top-3 h-0.5 w-4 bg-amber-900" />
        <span className="absolute left-2 top-5 h-0.5 w-4 bg-amber-900" />
        <span className="absolute left-3.5 top-2 h-5 w-0.5 rotate-45 bg-amber-900" />
      </span>
    );
  }

  if (icon === 'seed' || icon === 'gacha') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute bottom-1 left-[14px] h-5 w-1.5 rounded-full bg-green-800" />
        <span className="absolute left-1.5 top-2 h-3.5 w-5 -rotate-12 rounded-full bg-meadow" />
        <span className="absolute right-1 top-1.5 h-3.5 w-4 rotate-12 rounded-full bg-lime-300" />
      </span>
    );
  }

  if (icon === 'profile') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-berry" />
        <span className="absolute bottom-1.5 left-1/2 h-3.5 w-5 -translate-x-1/2 rounded-t-full bg-meadow" />
      </span>
    );
  }

  if (icon === 'cup') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute left-2 top-1.5 h-4 w-4 rounded-b-lg rounded-t-sm bg-gradient-to-b from-berry to-rose-400" />
        <span className="absolute right-1 top-3 h-2 w-2 rounded-r-full border-2 border-berry border-l-0" />
        <span className="absolute bottom-1.5 left-2.5 h-1.5 w-3 rounded bg-berry" />
      </span>
    );
  }

  if (icon === 'basket') {
    return (
      <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
        <span className="absolute bottom-1.5 left-1.5 h-4 w-5 rounded-b-lg bg-amber-500" />
        <span className="absolute left-2 top-2 h-4 w-4 rounded-t-full border-2 border-amber-800 border-b-0" />
        <span className="absolute left-3 top-4 h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-lime-400" />
      </span>
    );
  }

  return (
    <span className={`relative h-8 w-8 shrink-0 rounded-xl border-2 ${base} shadow-pixel`}>
      <span className="absolute inset-x-1.5 bottom-1.5 h-4 rounded bg-meadow" />
      <span className="absolute left-1 top-2 h-3 w-6 rotate-[-12deg] rounded bg-sun" />
    </span>
  );
}
