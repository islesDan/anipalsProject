import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PixelAvatar } from '../components/PixelAvatar';
import { WeatherBanner } from '../components/WeatherBanner';
import { useMockGame } from '../hooks/useMockGame';
import type { PageId } from '../types/game';

export function DashboardPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { anipals, quests } = useMockGame();

  return (
    <div className="grid gap-5">
      <WeatherBanner />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card title="Farm Overview">
          <div className="grid grid-cols-6 gap-2 rounded-2xl bg-lime-100 p-4">
            {Array.from({ length: 36 }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-md border-2 border-white shadow-pixel ${
                  index % 7 === 0 ? 'bg-pond' : index % 3 === 0 ? 'bg-soil' : 'bg-meadow'
                }`}
              />
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button variant="secondary" onClick={() => onNavigate('inventory')}>Open Inventory</Button>
            <Button onClick={() => onNavigate('gacha')}>Pull Banner</Button>
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
                <p className="mt-2 text-sm font-bold text-ink/70">Reward: {quest.reward}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Active AniPals">
        <div className="grid gap-4 md:grid-cols-3">
          {anipals.map((pal) => (
            <article key={pal.id} className="flex items-center gap-4 rounded-2xl border-2 border-ink/10 bg-white p-4 shadow-pixel">
              <PixelAvatar name={pal.name} palette={pal.palette} />
              <div>
                <h3 className="text-lg font-black">{pal.name}</h3>
                <p className="text-sm font-bold text-ink/70">{pal.species} - {pal.role}</p>
                <p className="mt-1 text-xs font-black text-berry">Lv {pal.level} / {pal.mood}</p>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
