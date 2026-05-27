import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import type { PageId } from '../types/game';

export function CreatePlayerPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-black uppercase tracking-wide text-pond">Farmer identity</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Name your player</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">This is the name friends will see when trading or visiting your farm.</p>

      <form className="mt-8 grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <FormField label="Player name" placeholder="Mira Sprout" maxLength={18} />
        <FormField label="Farm name" placeholder="Sunberry Acres" maxLength={24} />
        <Button type="button" className="w-full py-3" onClick={() => onNavigate('tutorial')}>
          Start Tutorial
        </Button>
      </form>
    </div>
  );
}
