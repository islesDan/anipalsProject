import type { ReactNode } from 'react';
import { PixelAvatar } from '../components/PixelAvatar';
import { ResourceBar } from '../components/ResourceBar';
import { useMockGame } from '../hooks/useMockGame';
import type { PageId } from '../types/game';

type AppShellProps = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
};

const navItems: Array<{ id: PageId; label: string; mark: string }> = [
  { id: 'dashboard', label: 'Farm', mark: 'F' },
  { id: 'inventory', label: 'Inventory', mark: 'I' },
  { id: 'gacha', label: 'Gacha', mark: 'G' },
  { id: 'trading', label: 'Trading', mark: 'T' },
  { id: 'friends', label: 'Friends', mark: 'U' },
  { id: 'tutorial', label: 'Tutorial', mark: '?' },
];

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const { player } = useMockGame();

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
            <div className="text-sm font-black">{player.name}</div>
            <div className="text-xs font-bold text-ink/60">{player.uid}</div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 w-3/4 rounded-full bg-berry" />
            </div>
            <div className="mt-1 text-xs font-bold text-ink/60">Level {player.level} farmer</div>
          </div>

          <nav className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left text-sm font-black transition hover:-translate-y-0.5 ${
                  activePage === item.id
                    ? 'border-berry bg-rose-50 text-berry shadow-pixel'
                    : 'border-transparent bg-white/70 text-ink hover:border-ink/10'
                }`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-sun text-xs text-ink">{item.mark}</span>
                {item.label}
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
    </main>
  );
}
