import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { InventoryGrid } from '../components/InventoryGrid';
import { useMockGame } from '../hooks/useMockGame';
import { localGameService } from '../services/localGame';
import { setCurrencies } from '../services/currency';
import type { Friend, InventoryItem } from '../types/game';

export function TradingPage() {
  const { friends, inventory: fallbackInventory } = useMockGame();
  const [showConfirm, setShowConfirm] = useState(false);
  const [uid, setUid] = useState('ANI-1138');
  const [target, setTarget] = useState<Friend | null>(friends[0] ?? null);
  const [inventory, setInventory] = useState<InventoryItem[]>(fallbackInventory);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [status, setStatus] = useState('Select a friend and choose items to draft a trade.');
  const [sentTrades, setSentTrades] = useState<string[]>([]);

  useEffect(() => {
    localGameService.state()
      .then((state) => setInventory(state.inventory))
      .catch(() => setStatus('Using starter inventory for this trade draft.'));
  }, []);

  function searchPlayer() {
    const normalizedUid = uid.trim().toUpperCase();
    const found = friends.find((friend) => friend.uid.toLowerCase() === normalizedUid.toLowerCase());
    setTarget(found ?? null);
    setStatus(found ? `Trade target set to ${found.name}.` : /^ANI-[A-Z0-9]{4}(?:-[A-Z0-9]{4})?$/.test(normalizedUid) ? 'No player found with that UID.' : 'UID should look like ANI-AB12-CD34.');
  }

  function toggleItem(item: InventoryItem) {
    setSelectedItems((current) => (
      current.some((selected) => selected.id === item.id)
        ? current.filter((selected) => selected.id !== item.id)
        : [...current, item].slice(0, 4)
    ));
  }

  function reviewTrade() {
    if (!target) {
      setStatus('Search for a valid friend before sending a trade.');
      return;
    }
    if (selectedItems.length === 0) {
      setStatus('Choose at least one item to offer.');
      return;
    }
    setShowConfirm(true);
  }

  async function sendTrade() {
    if (!target) return;
    setShowConfirm(false);
    const summary = `${target?.name}: ${selectedItems.map((item) => item.name).join(', ')}`;
    const next = await localGameService.sendTrade(target.name, selectedItems.map((item) => item.id));
    setInventory(next.inventory);
    setCurrencies({
      coins: next.currencies.coins,
      gems: next.currencies.gems,
      energy: next.currencies.energy,
      sprouts: next.currencies.sprouts,
    });
    setSentTrades((current) => [summary, ...current].slice(0, 3));
    setStatus(next.status);
    setSelectedItems([]);
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card title="Find Player UID">
          <div className="grid gap-4">
            <FormField label="Friend UID" placeholder="ANI-AB12-CD34" value={uid} onChange={(event) => setUid(event.target.value)} />
            <Button variant="secondary" onClick={searchPlayer}>Search Player</Button>
            {target ? (
              <div className="rounded-2xl border-2 border-meadow bg-green-50 p-4">
                <div className="text-xs font-black uppercase text-green-700">Trade target</div>
                <div className="mt-1 text-lg font-black">{target.name}</div>
                <p className="text-sm font-bold text-ink/70">{target.farm} - {target.status}</p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-berry bg-rose-50 p-4 text-sm font-bold text-ink/70">No target selected.</div>
            )}
          </div>
        </Card>

        <Card title="Select Trade Items" action={<Button onClick={reviewTrade}>Review Trade</Button>}>
          <InventoryGrid items={inventory.filter((item) => item.quantity > 0).slice(0, 12)} selectable selectedIds={selectedItems.map((item) => item.id)} onSelect={toggleItem} />
          <p className="mt-4 rounded-xl bg-cream p-4 text-sm font-bold text-ink/70" aria-live="polite">
            {selectedItems.length ? `Offering ${selectedItems.map((item) => item.name).join(', ')}.` : 'No items selected yet.'}
          </p>
        </Card>
      </div>

      <Card title="Trade Status">
        <div className="grid gap-3 md:grid-cols-3">
          {['Request drafted', 'Items sent locally', 'Friend return received'].map((status, index) => (
            <div key={status} className="rounded-xl border-2 border-ink/10 bg-cream p-4">
              <div className="mb-3 h-2 rounded-full bg-white">
                <div className={`h-2 rounded-full ${index === 0 ? 'w-full bg-meadow' : index === 1 ? 'w-1/2 bg-sun' : 'w-1/4 bg-pond'}`} />
              </div>
              <p className="text-sm font-black">{status}</p>
            </div>
          ))}
        </div>
        {sentTrades.length > 0 && (
          <div className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-ink/70 shadow-pixel">
            Recent requests: {sentTrades.join(' | ')}
          </div>
        )}
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/50 p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-white bg-cream p-6 shadow-soft">
            <h2 className="text-2xl font-black">Confirm Trade</h2>
            <p className="mt-2 text-sm font-bold text-ink/70">Send selected items to {target?.name}. One quantity of each selected item leaves your inventory, and your friend sends coins back.</p>
            <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-bold shadow-pixel">
              Offering: {selectedItems.map((item) => `${item.name} x${item.quantity}`).join(', ')}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={sendTrade}>Send Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
