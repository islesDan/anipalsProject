import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { PixelAvatar } from '../components/PixelAvatar';
import { useMockGame } from '../hooks/useMockGame';
import { playerService } from '../services/api';
import { currentPlayerKey, getSession } from '../services/session';
import type { FarmPlot, Friend, FriendFarmPreview, FriendMessage, FriendRequest, PlayerSearchResult } from '../types/game';

type ChatMessage = {
  id: string;
  friendUid: string;
  sender: 'me' | 'friend';
  text: string;
  time: string;
};

type FriendsTab = 'friends' | 'requests' | 'add';

const palettes = ['bg-sun', 'bg-pond', 'bg-berry'];
const starterIncoming: FriendRequest[] = [];

function normalizeFriend(friend: Friend): Friend {
  const status = ['Online', 'Away', 'Offline'].includes(friend.status) ? friend.status : 'Offline';
  return { ...friend, status: status as Friend['status'] };
}

function messageFromApi(message: FriendMessage, activeFriendUid: string, accountKey: string, accountUid?: string): ChatMessage {
  const sentByMe = message.senderKey === accountKey || Boolean(accountUid && message.senderUid === accountUid);
  const friendUid = sentByMe ? message.recipientUid : (message.senderUid ?? activeFriendUid);

  return {
    id: message.id,
    friendUid,
    sender: sentByMe ? 'me' : 'friend',
    text: message.message,
    time: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export function FriendsPage() {
  const { friends, player } = useMockGame();
  const [accountSession] = useState(() => getSession());
  const [accountKey] = useState(() => accountSession?.playerKey ?? currentPlayerKey());
  const accountUid = accountSession?.uid ?? player.uid;
  const [tab, setTab] = useState<FriendsTab>('friends');
  const [searchUid, setSearchUid] = useState('');
  const [status, setStatus] = useState('Load friends, manage requests, or search by UID/name.');
  const [friendList, setFriendList] = useState<Friend[]>(friends);
  const [activeFriend, setActiveFriend] = useState(friends[0]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(starterIncoming);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [maxFriends, setMaxFriends] = useState(100);
  const [draftMessage, setDraftMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [farmPreview, setFarmPreview] = useState<FriendFarmPreview | null>(null);

  async function refreshFriendSummary(options: { silent?: boolean } = {}) {
    const { data } = await playerService.friendSummary(accountKey);
    const loadedFriends = data.friends.map(normalizeFriend);
    const loadedIncoming = data.incomingRequests.map((request) => ({ ...request, player: normalizeFriend(request.player) }));
    const loadedOutgoing = data.outgoingRequests.map((request) => ({ ...request, player: normalizeFriend(request.player) }));

    setFriendList(loadedFriends);
    setIncomingRequests(loadedIncoming);
    setOutgoingRequests(loadedOutgoing);
    setMaxFriends(data.maxFriends);
    setActiveFriend((current) => loadedFriends.find((friend) => friend.uid === current?.uid) ?? loadedFriends[0] ?? current);

    if (!options.silent) {
      const requestCount = loadedIncoming.length + loadedOutgoing.length;
      setStatus(`Friends synced. ${loadedFriends.length} friend(s), ${requestCount} pending request(s).`);
    }
  }

  useEffect(() => {
    let cancelled = false;

    refreshFriendSummary({ silent: true })
      .catch(() => {
        if (!cancelled) {
          setFriendList(friends);
          setStatus('Using local demo social data. Backend friends API is unavailable.');
        }
      });

    const interval = window.setInterval(() => {
      refreshFriendSummary({ silent: true }).catch(() => {
        // Keep the last known list while the backend is temporarily unavailable.
      });
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accountKey, friends]);

  const activeMessages = useMemo(
    () => messages.filter((message) => message.friendUid === activeFriend.uid),
    [activeFriend.uid, messages],
  );

  useEffect(() => {
    if (!activeFriend?.uid) return;
    let cancelled = false;

    async function refreshMessages() {
      try {
        const { data } = await playerService.friendMessages(activeFriend.uid, accountKey);
        if (!cancelled) {
          setMessages((current) => {
            const otherMessages = current.filter((message) => message.friendUid !== activeFriend.uid);
            return [...otherMessages, ...data.map((message) => messageFromApi(message, activeFriend.uid, accountKey, accountUid))];
          });
        }
      } catch {
        // Keep local demo messages when the API is offline.
      }
    }

    refreshMessages();
    const interval = window.setInterval(refreshMessages, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accountKey, accountUid, activeFriend?.uid]);

  useEffect(() => {
    if (!activeFriend?.uid) return;
    let cancelled = false;

    async function refreshPreview() {
      try {
        const { data } = await playerService.previewFriendFarm(activeFriend.uid);
        if (!cancelled) setFarmPreview(data);
      } catch {
        if (!cancelled) setFarmPreview(null);
      }
    }

    refreshPreview();
    const interval = window.setInterval(refreshPreview, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeFriend?.uid]);

  const pendingCount = incomingRequests.length + outgoingRequests.length;

  async function searchPlayers() {
    const normalizedUid = searchUid.trim().toUpperCase();
    if (!normalizedUid) {
      setStatus('Enter a UID or username before searching.');
      return;
    }

    try {
      const { data } = await playerService.searchPlayers(normalizedUid, accountKey);
      setSearchResults(data);
      setStatus(data.length ? `Found ${data.length} matching player(s).` : 'No players found.');
    } catch {
      const alreadyFriend = friendList.find((friend) => friend.uid.toLowerCase() === normalizedUid.toLowerCase());
      setSearchResults([]);
      setStatus(alreadyFriend ? `${alreadyFriend.name} is already your friend.` : 'Backend search unavailable. You can still send a demo request by UID.');
    }
  }

  async function sendRequest(targetUid = searchUid) {
    const targetIdentifier = targetUid.trim();
    const found = friendList.find((friend) =>
      friend.uid.toLowerCase() === targetIdentifier.toLowerCase()
      || friend.name.toLowerCase() === targetIdentifier.toLowerCase(),
    );

    if (!targetIdentifier) {
      setStatus('Enter a UID or username before sending a request.');
      return;
    }

    if (found) {
      openFriend(found, 'preview');
      setStatus(`${found.name} is already your friend.`);
      return;
    }

    if (outgoingRequests.some((request) =>
      request.player.uid.toLowerCase() === targetIdentifier.toLowerCase()
      || request.player.name.toLowerCase() === targetIdentifier.toLowerCase(),
    )) {
      setStatus(`Friend request to ${targetIdentifier} is already pending.`);
      return;
    }

    try {
      const { data } = await playerService.sendFriendRequest(targetIdentifier, accountKey);
      setOutgoingRequests((current) => [...current, { ...data, player: normalizeFriend(data.player) }]);
      refreshFriendSummary({ silent: true }).catch(() => {});
    } catch {
      setOutgoingRequests((current) => [
        ...current,
        {
          id: Date.now(),
          player: { uid: targetIdentifier.toUpperCase(), name: targetIdentifier, farm: 'Unknown Farm', status: 'Offline' },
          requestedAt: new Date().toISOString(),
        },
      ]);
    }

    setTab('requests');
    setStatus(`Friend request sent to ${targetIdentifier}.`);
  }

  async function acceptRequest(request: FriendRequest) {
    try {
      await playerService.acceptFriendRequest(request.id, accountKey);
      refreshFriendSummary({ silent: true }).catch(() => {});
    } catch {
      // Keep local demo flow usable when the API is not running.
    }

    setIncomingRequests((current) => current.filter((item) => item.id !== request.id));
    setFriendList((current) => [...current, request.player]);
    setActiveFriend(request.player);
    setTab('friends');
    setStatus(`${request.player.name} added to your friends.`);
  }

  async function declineRequest(request: FriendRequest) {
    try {
      if (request.id > 0) await playerService.declineFriendRequest(request.id, accountKey);
      refreshFriendSummary({ silent: true }).catch(() => {});
    } catch {
      // Local state still reflects the player's intent.
    }

    setIncomingRequests((current) => current.filter((item) => item.id !== request.id));
    setStatus(`Declined request from ${request.player.name}.`);
  }

  async function cancelRequest(request: FriendRequest) {
    try {
      if (request.id > 0) await playerService.cancelFriendRequest(request.id, accountKey);
      refreshFriendSummary({ silent: true }).catch(() => {});
    } catch {
      // Local fallback.
    }

    setOutgoingRequests((current) => current.filter((item) => item.id !== request.id));
    setStatus(`Cancelled request to ${request.player.uid}.`);
  }

  async function removeFriend(friend: Friend) {
    try {
      await playerService.removeFriend(friend.uid, accountKey);
    } catch {
      // Local fallback.
    }

    setFriendList((current) => current.filter((item) => item.uid !== friend.uid));
    setActiveFriend((current) => current.uid === friend.uid ? (friendList.find((item) => item.uid !== friend.uid) ?? friends[0]) : current);
    setStatus(`${friend.name} removed from your friends.`);
  }

  async function blockFriend(friend: Friend) {
    try {
      await playerService.blockPlayer(friend.uid, accountKey);
    } catch {
      // Local fallback.
    }

    setFriendList((current) => current.filter((item) => item.uid !== friend.uid));
    setIncomingRequests((current) => current.filter((request) => request.player.uid !== friend.uid));
    setOutgoingRequests((current) => current.filter((request) => request.player.uid !== friend.uid));
    setStatus(`${friend.name} blocked. They will not be able to send requests.`);
  }

  function openFriend(friend: Friend, mode: 'preview' | 'message') {
    setActiveFriend(friend);
    setStatus(mode === 'preview' ? `Opening ${friend.farm} preview.` : `Messaging ${friend.name}.`);
  }

  async function sendMessage() {
    const text = draftMessage.trim();

    if (!text) {
      setStatus('Write a short message before sending.');
      return;
    }

    try {
      const { data } = await playerService.sendFriendMessage(activeFriend.uid, text, accountKey);
      setMessages((current) => [...current, messageFromApi(data, activeFriend.uid, accountKey, accountUid)]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: `m${Date.now()}`, friendUid: activeFriend.uid, sender: 'me', text, time: 'Now' },
      ]);
    }
    setStatus(`Message sent to ${activeFriend.name}.`);
    setDraftMessage('');
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Card title="Profile">
        <div className="flex items-center gap-4">
          <div className="relative">
            <PixelAvatar name={player.name} palette="bg-meadow" size="lg" />
            <span className="absolute -right-1 -top-1 h-7 w-7 rounded-full border-2 border-white bg-sun shadow-pixel">
              <span className="absolute bottom-1 left-3 h-4 w-1 rounded bg-green-800" />
              <span className="absolute left-1 top-2 h-2.5 w-4 rounded-full bg-lime-300" />
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black">{player.name}</h2>
            <p className="font-bold text-ink/60">{player.uid}</p>
            <p className="mt-2 rounded-full bg-sun px-3 py-1 text-xs font-black">Level {player.level}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <TabButton active={tab === 'friends'} onClick={() => setTab('friends')}>Friends</TabButton>
          <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>Requests {pendingCount ? `(${pendingCount})` : ''}</TabButton>
          <TabButton active={tab === 'add'} onClick={() => setTab('add')}>Add</TabButton>
        </div>
        <p className="mt-4 rounded-xl bg-cream p-3 text-sm font-bold text-ink/70" aria-live="polite">{status}</p>
        <p className="mt-3 text-xs font-black text-ink/50">{friendList.length} / {maxFriends} friends</p>
      </Card>

      <Card title="Friends and Messages">
        {tab === 'friends' && (
          <FriendsList
            friends={friendList}
            activeFriend={activeFriend}
            onOpen={openFriend}
            onRemove={removeFriend}
            onBlock={blockFriend}
          />
        )}

        {tab === 'requests' && (
          <PendingRequests
            incoming={incomingRequests}
            outgoing={outgoingRequests}
            onAccept={acceptRequest}
            onDecline={declineRequest}
            onCancel={cancelRequest}
          />
        )}

        {tab === 'add' && (
          <section className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <FormField label="Search player UID or username" placeholder="ANI-AB12-CD34 or Juniper" value={searchUid} onChange={(event) => setSearchUid(event.target.value)} />
              <Button className="self-end" variant="ghost" onClick={searchPlayers}>Search</Button>
              <Button className="self-end" variant="secondary" onClick={() => sendRequest()}>Send Request</Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {searchResults.map((result) => (
                <article key={result.uid} className="rounded-2xl border-2 border-ink/10 bg-cream p-4 shadow-pixel">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{result.name}</h3>
                      <p className="text-sm font-bold text-ink/70">{result.farm}</p>
                      <p className="mt-1 text-xs font-black text-berry">{result.uid} - {result.relationshipStatus}</p>
                    </div>
                    <Button disabled={result.relationshipStatus !== 'NONE'} onClick={() => sendRequest(result.uid)}>Request</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'friends' && friendList.length > 0 && (
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
            <FarmPreview friend={activeFriend} preview={farmPreview} />
            <section className="rounded-2xl border-2 border-ink/10 bg-white p-4 shadow-pixel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black">Chat with {activeFriend.name}</h3>
                  <p className="text-xs font-bold text-ink/60">{activeFriend.status}</p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-black">{activeMessages.length} messages</span>
              </div>
              <div className="grid max-h-80 min-h-64 content-end gap-3 overflow-y-auto rounded-xl bg-cream p-3">
                {activeMessages.map((message) => (
                  <div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-bold shadow-pixel ${message.sender === 'me' ? 'ml-auto bg-berry text-white' : 'bg-white text-ink'}`}>
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[11px] ${message.sender === 'me' ? 'text-white/75' : 'text-ink/50'}`}>{message.time}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <FormField label="Direct message" placeholder={`Say hi to ${activeFriend.name}`} value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} />
                <Button className="self-end" onClick={sendMessage}>Send</Button>
              </div>
            </section>
          </div>
        )}
      </Card>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`rounded-xl border-2 px-3 py-2 text-xs font-black shadow-pixel transition ${active ? 'border-berry bg-berry text-white' : 'border-ink/10 bg-white text-ink'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FriendsList({
  friends,
  activeFriend,
  onOpen,
  onRemove,
  onBlock,
}: {
  friends: Friend[];
  activeFriend: Friend;
  onOpen: (friend: Friend, mode: 'preview' | 'message') => void;
  onRemove: (friend: Friend) => void;
  onBlock: (friend: Friend) => void;
}) {
  if (!friends.length) {
    return <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/70">No friends yet. Search by UID or username to send a request.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {friends.map((friend, index) => (
        <article key={friend.uid} className={`rounded-2xl border-2 bg-cream p-4 shadow-pixel ${activeFriend.uid === friend.uid ? 'border-berry' : 'border-ink/10'}`}>
          <button type="button" className="flex w-full items-center gap-4 text-left" onClick={() => onOpen(friend, 'preview')}>
            <PixelAvatar name={friend.name} palette={palettes[index % palettes.length]} />
            <div>
              <h3 className="text-lg font-black">{friend.name}</h3>
              <p className="text-sm font-bold text-ink/70">{friend.farm}</p>
              <p className="mt-1 text-xs font-black text-berry">{friend.uid} - {friend.status}</p>
            </div>
          </button>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => onOpen(friend, 'preview')}>Preview</Button>
            <Button onClick={() => onOpen(friend, 'message')}>Message</Button>
            <Button variant="ghost" onClick={() => onRemove(friend)}>Remove</Button>
            <Button variant="danger" onClick={() => onBlock(friend)}>Block</Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function PendingRequests({
  incoming,
  outgoing,
  onAccept,
  onDecline,
  onCancel,
}: {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  onAccept: (request: FriendRequest) => void;
  onDecline: (request: FriendRequest) => void;
  onCancel: (request: FriendRequest) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border-2 border-ink/10 bg-white p-4 shadow-pixel">
        <h3 className="mb-3 font-black">Incoming Requests</h3>
        <RequestList emptyText="No incoming requests." requests={incoming} action={(request) => (
          <>
            <Button onClick={() => onAccept(request)}>Accept</Button>
            <Button variant="ghost" onClick={() => onDecline(request)}>Decline</Button>
          </>
        )} />
      </section>
      <section className="rounded-2xl border-2 border-ink/10 bg-white p-4 shadow-pixel">
        <h3 className="mb-3 font-black">Sent Requests</h3>
        <RequestList emptyText="No outgoing requests." requests={outgoing} action={(request) => (
          <Button variant="ghost" onClick={() => onCancel(request)}>Cancel</Button>
        )} />
      </section>
    </div>
  );
}

function RequestList({ requests, emptyText, action }: { requests: FriendRequest[]; emptyText: string; action: (request: FriendRequest) => ReactNode }) {
  if (!requests.length) {
    return <p className="rounded-xl bg-cream p-3 text-sm font-bold text-ink/60">{emptyText}</p>;
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <article key={request.id} className="rounded-xl bg-cream p-3 shadow-pixel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-black">{request.player.name}</h4>
              <p className="text-xs font-bold text-ink/60">{request.player.uid} - {request.player.farm}</p>
            </div>
            <div className="flex gap-2">{action(request)}</div>
          </div>
        </article>
      ))}
    </div>
  );
}

function FarmPreview({ friend, preview }: { friend: Friend; preview: FriendFarmPreview | null }) {
  const seed = friend.uid.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const farmPlots = preview?.farmPlots ?? fallbackFarmPlots(seed);
  const farmName = preview?.farmName ?? friend.farm;

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-white shadow-pixel">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-lime-100 to-sky-100 px-4 py-3">
        <div>
          <h3 className="font-black">{friend.name}'s Farm Preview</h3>
          <p className="text-xs font-bold text-ink/60">{farmName}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-berry">
          {preview ? 'Live view' : 'Demo view'}
        </span>
      </div>
      <div className="grid gap-3 bg-lime-100 p-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border-2 border-amber-700/30 bg-amber-700/30 p-3">
          <div className="grid grid-cols-4 gap-2">
            {farmPlots.map((plot) => (
              <span
                key={plot.plotIndex}
                className={`flex aspect-square items-center justify-center rounded-lg border-2 border-white text-[10px] font-black uppercase shadow-inner ${farmTileColor(plot)}`}
                title={`${plot.crop} - ${plot.state}`}
              >
                {plot.state === 'CLEARED' ? '' : cropLabel(plot.crop)}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border-2 border-white bg-pond p-3 shadow-pixel">
            <div className="h-16 rounded-full bg-cyan-300/70" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index} className="aspect-square rounded-full bg-meadow shadow-pixel">
                <span className="block h-2 w-2 translate-x-3 translate-y-2 rounded-full bg-sun" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function fallbackFarmPlots(seed: number): FarmPlot[] {
  const crops = ['carrots', 'berries', 'rice', 'pumpkins'];
  return Array.from({ length: 12 }).map((_, index) => ({
    plotIndex: index,
    crop: crops[(seed + index) % crops.length],
    state: index % 4 === 0 ? 'CLEARED' : index % 3 === 0 ? 'READY' : 'PLANTED',
  }));
}

function farmTileColor(plot: FarmPlot) {
  if (plot.state === 'CLEARED') return 'bg-amber-300/70 text-amber-900';
  if (plot.state === 'READY') return 'bg-sun text-amber-950';
  if (plot.crop.toLowerCase().includes('carrot')) return 'bg-orange-300 text-orange-950';
  if (plot.crop.toLowerCase().includes('berry')) return 'bg-berry text-white';
  if (plot.crop.toLowerCase().includes('rice')) return 'bg-lime-300 text-lime-950';
  return 'bg-meadow text-green-950';
}

function cropLabel(crop: string) {
  return crop.slice(0, 2);
}
