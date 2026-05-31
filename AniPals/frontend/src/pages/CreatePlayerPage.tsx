import { useState } from 'react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { playerService } from '../services/api';
import { localGameService } from '../services/localGame';
import type { PageId } from '../types/game';

export function CreatePlayerPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [playerName, setPlayerName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState('');

  async function startTutorial() {
    if (!playerName.trim() || !farmName.trim()) {
      setError('Enter both names before starting.');
      return;
    }

    const name = playerName.trim();
    const farm = farmName.trim();
    try {
      await playerService.updateName(name, farm);
    } catch {
      // The local game is still updated so itch/offline builds can continue.
    }
    await localGameService.updateProfile(name, farm);
    onNavigate('tutorial');
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-black uppercase tracking-wide text-pond">Farmer identity</p>
      <h2 className="mt-2 text-4xl font-black text-ink">Name your player</h2>
      <p className="mt-3 text-sm font-bold text-ink/70">This is the name friends will see when trading or visiting your farm.</p>

      <form className="mt-8 grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <FormField label="Player name" placeholder="Mira Sprout" maxLength={18} value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
        <FormField label="Farm name" placeholder="Sunberry Acres" maxLength={24} value={farmName} onChange={(event) => setFarmName(event.target.value)} />
        {error && <p className="text-sm font-bold text-red-600" aria-live="polite">{error}</p>}
        <Button type="button" className="w-full py-3" onClick={startTutorial}>
          Start Tutorial
        </Button>
      </form>
    </div>
  );
}
