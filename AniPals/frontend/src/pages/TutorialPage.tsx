import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { gameService } from '../services/api';
import { localGameService } from '../services/localGame';
import type { PageId } from '../types/game';

const steps = [
  { title: 'Plant and Harvest', body: 'Harvest ready crops, then tap cleared soil to plant seeds for the next cycle.', page: 'dashboard' as PageId },
  { title: 'Manage Inventory', body: 'Use seeds, treats, and crops from inventory to keep the farm moving.', page: 'inventory' as PageId },
  { title: 'Gacha Banners', body: 'Spend gems, watch pity progress, and review your pull history.', page: 'gacha' as PageId },
  { title: 'Trade With Friends', body: 'Search by UID, pick items from inventory, and confirm the request.', page: 'trading' as PageId },
];

const tutorialStorageKey = 'anipals.tutorial.completedSteps';

export function TutorialPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  const nextStep = steps.find((step) => !completedSteps.includes(step.title)) ?? steps[steps.length - 1];

  useEffect(() => {
    const stored = localStorage.getItem(tutorialStorageKey);
    if (!stored) return;

    try {
      setCompletedSteps(JSON.parse(stored));
    } catch {
      setCompletedSteps([]);
    }
  }, []);

  async function toggleStep(title: string) {
    let shouldFinish = false;
    setCompletedSteps((current) => {
      const next = current.includes(title) ? current.filter((step) => step !== title) : [...current, title];
      localStorage.setItem(tutorialStorageKey, JSON.stringify(next));
      shouldFinish = next.length === steps.length;
      return next;
    });
    if (shouldFinish) {
      await finishTutorial();
    }
  }

  async function finishTutorial() {
    const next = steps.map((step) => step.title);
    localStorage.setItem(tutorialStorageKey, JSON.stringify(next));
    setCompletedSteps(next);
    try {
      await gameService.completeTutorial();
    } catch {
      // Local completion keeps the itch/offline flow unblocked if the API is unavailable.
    }
    await localGameService.completeTutorial();
    onNavigate('dashboard');
  }

  return (
    <div className="grid gap-5">
      <Card title="Tutorial Path" action={<Button onClick={() => progress === 100 ? finishTutorial() : onNavigate(nextStep.page)}>Continue</Button>}>
        <div className="mb-5 rounded-2xl bg-cream p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-black">Progress</span>
            <span className="text-sm font-black">{progress}%</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-meadow" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink/70">
              {progress === 100 ? 'Tutorial complete. You can revisit any section anytime.' : `Next: ${nextStep.title}`}
            </p>
            <Button type="button" variant="ghost" onClick={finishTutorial}>Mark All Done</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border-2 border-ink/10 bg-cream p-5 transition hover:-translate-y-1 hover:shadow-pixel">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-sun text-xl font-black text-ink">
                {index + 1}
              </div>
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm font-bold text-ink/70">{step.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant={completedSteps.includes(step.title) ? 'secondary' : 'ghost'} onClick={() => toggleStep(step.title)}>
                  {completedSteps.includes(step.title) ? 'Completed' : 'Mark Done'}
                </Button>
                <Button type="button" onClick={() => onNavigate(step.page)}>Try It</Button>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
