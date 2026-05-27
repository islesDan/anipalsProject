import { Button } from '../components/Button';
import { Card } from '../components/Card';
import type { PageId } from '../types/game';

const steps = [
  ['Plant and Harvest', 'Choose seeds, water plots, and harvest crops when the timer completes. Weather events can boost growth.'],
  ['Care for AniPals', 'Assign companions to farm jobs. Their mood and level affect bonuses for planting, watering, and gathering.'],
  ['Trade With Friends', 'Search by UID, pick items from inventory, and confirm both sides before the exchange completes.'],
  ['Gacha Banners', 'Spend gems or tickets on limited banners. Pity progress carries mock state here and is ready for API backing.'],
];

export function TutorialPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="grid gap-5">
      <Card title="Tutorial Path" action={<Button onClick={() => onNavigate('dashboard')}>Go to Farm</Button>}>
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border-2 border-ink/10 bg-cream p-5 transition hover:-translate-y-1 hover:shadow-pixel">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-sun text-xl font-black text-ink">
                {index + 1}
              </div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm font-bold text-ink/70">{body}</p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
