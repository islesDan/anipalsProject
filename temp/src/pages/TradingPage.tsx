import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { InventoryGrid } from '../components/InventoryGrid';
import { useMockGame } from '../hooks/useMockGame';

export function TradingPage() {
  const { inventory } = useMockGame();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card title="Find Player UID">
          <div className="grid gap-4">
            <FormField label="Friend UID" placeholder="ANI-1138" />
            <Button variant="secondary">Search Player</Button>
            <div className="rounded-2xl border-2 border-meadow bg-green-50 p-4">
              <div className="text-xs font-black uppercase text-green-700">Trade target</div>
              <div className="mt-1 text-lg font-black">Juniper</div>
              <p className="text-sm font-bold text-ink/70">Peach Puddle Farm - Online</p>
            </div>
          </div>
        </Card>

        <Card title="Select Trade Items" action={<Button onClick={() => setShowConfirm(true)}>Review Trade</Button>}>
          <InventoryGrid items={inventory.slice(0, 8)} selectable />
        </Card>
      </div>

      <Card title="Trade Status">
        <div className="grid gap-3 md:grid-cols-3">
          {['Request drafted', 'Awaiting friend confirmation', 'No active exchange lock'].map((status, index) => (
            <div key={status} className="rounded-xl border-2 border-ink/10 bg-cream p-4">
              <div className="mb-3 h-2 rounded-full bg-white">
                <div className={`h-2 rounded-full ${index === 0 ? 'w-full bg-meadow' : index === 1 ? 'w-1/2 bg-sun' : 'w-1/4 bg-pond'}`} />
              </div>
              <p className="text-sm font-black">{status}</p>
            </div>
          ))}
        </div>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/50 p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-white bg-cream p-6 shadow-soft">
            <h2 className="text-2xl font-black">Confirm Trade</h2>
            <p className="mt-2 text-sm font-bold text-ink/70">Send selected items to Juniper for approval. Backend confirmation will attach here later.</p>
            <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-bold shadow-pixel">
              Offering: Carrot Seeds x4, Berry Jam x2
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={() => setShowConfirm(false)}>Send Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
