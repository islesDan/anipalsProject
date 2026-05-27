import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PixelAvatar } from '../components/PixelAvatar';
import { useMockGame } from '../hooks/useMockGame';

export function GachaPage() {
  const { gachaHistory } = useMockGame();

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card title="Season Banner" className="overflow-hidden">
        <div className="pixel-grid rounded-2xl bg-gradient-to-br from-berry via-orange-300 to-sun p-6 text-white">
          <p className="text-sm font-black uppercase tracking-wide text-white/80">Limited Companion Banner</p>
          <h2 className="mt-2 text-4xl font-black">Harvest Helpers</h2>
          <p className="mt-3 max-w-xl text-sm font-bold text-white/90">Higher odds for farm-job AniPals and rare treats through the festival window.</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid h-52 flex-1 place-items-center rounded-2xl border-4 border-white/70 bg-white/25">
              <div className="flex items-end gap-4">
                <PixelAvatar name="Pip" palette="bg-pink-300" size="lg" />
                <PixelAvatar name="Neo" palette="bg-cyan-300" size="lg" />
                <PixelAvatar name="Sol" palette="bg-yellow-300" size="lg" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 text-ink shadow-pixel">
              <div className="text-xs font-black text-ink/60">Pity Counter</div>
              <div className="text-3xl font-black">62 / 80</div>
              <div className="mt-2 h-3 rounded-full bg-cream">
                <div className="h-3 w-[77%] rounded-full bg-berry" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button className="py-3">Pull 1</Button>
          <Button variant="secondary" className="py-3">Pull 10</Button>
        </div>
      </Card>

      <Card title="Pull History">
        <div className="grid gap-3">
          {gachaHistory.map((item) => (
            <div key={item.id} className="rounded-xl border-2 border-ink/10 bg-cream p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{item.result}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-berry">{item.rarity}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-ink/60">{item.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
