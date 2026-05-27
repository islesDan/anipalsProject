import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { PixelAvatar } from '../components/PixelAvatar';
import { useMockGame } from '../hooks/useMockGame';

const palettes = ['bg-sun', 'bg-pond', 'bg-berry'];

export function FriendsPage() {
  const { friends, player } = useMockGame();

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Card title="Profile">
        <div className="flex items-center gap-4">
          <PixelAvatar name={player.name} palette="bg-meadow" size="lg" />
          <div>
            <h2 className="text-2xl font-black">{player.name}</h2>
            <p className="font-bold text-ink/60">{player.uid}</p>
            <p className="mt-2 rounded-full bg-sun px-3 py-1 text-xs font-black">Level {player.level}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <FormField label="Search friend UID" placeholder="ANI-0000" />
          <Button variant="secondary">Send Friend Request</Button>
        </div>
      </Card>

      <Card title="Friends and Messages">
        <div className="grid gap-4 lg:grid-cols-2">
          {friends.map((friend, index) => (
            <article key={friend.uid} className="rounded-2xl border-2 border-ink/10 bg-cream p-4 shadow-pixel">
              <div className="flex items-center gap-4">
                <PixelAvatar name={friend.name} palette={palettes[index]} />
                <div>
                  <h3 className="text-lg font-black">{friend.name}</h3>
                  <p className="text-sm font-bold text-ink/70">{friend.farm}</p>
                  <p className="mt-1 text-xs font-black text-berry">{friend.uid} - {friend.status}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" className="flex-1">Visit</Button>
                <Button className="flex-1">Message</Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border-2 border-ink/10 bg-white p-4">
          <h3 className="font-black">Notifications</h3>
          <div className="mt-3 grid gap-2 text-sm font-bold text-ink/70">
            <p>Juniper accepted your berry trade request.</p>
            <p>Clover sent you a friendship crate.</p>
            <p>Festival gacha banner resets in 2 days.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
