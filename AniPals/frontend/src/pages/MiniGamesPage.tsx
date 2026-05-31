import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { localGameService } from '../services/localGame';
import { setCurrencies } from '../services/currency';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
type GameTab = 'blackjack' | 'cups' | 'tic-tac-toe';
type Suit = 'H' | 'D' | 'C' | 'S';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type PlayingCard = { suit: Suit; rank: Rank };
type Mark = 'X' | 'O' | null;
type CupPhase = 'show' | 'shuffle' | 'pick';

const difficulties: Array<{ id: Difficulty; label: string; reward: number; detail: string }> = [
  { id: 'easy', label: 'Easy', reward: 60, detail: 'Low risk' },
  { id: 'normal', label: 'Normal', reward: 120, detail: 'Steady reward' },
  { id: 'hard', label: 'Hard', reward: 210, detail: 'Sharper challenge' },
  { id: 'expert', label: 'Expert', reward: 340, detail: 'High reward' },
];

const tabs: Array<{ id: GameTab; label: string }> = [
  { id: 'blackjack', label: 'Blackjack' },
  { id: 'cups', label: 'Cup Game' },
  { id: 'tic-tac-toe', label: 'Tic Tac Toe' },
];

const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits: Suit[] = ['H', 'D', 'C', 'S'];
const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function rewardFor(difficulty: Difficulty) {
  return difficulties.find((item) => item.id === difficulty)?.reward ?? 40;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeDeck() {
  return shuffle(suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank }))));
}

function cardValue(card: PlayingCard) {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return Number(card.rank);
}

function handTotal(hand: PlayingCard[]) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter((card) => card.rank === 'A').length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function winner(board: Mark[]) {
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(Boolean)) return 'draw';
  return null;
}

function bestMove(board: Mark[], mark: 'X' | 'O') {
  for (const [a, b, c] of winLines) {
    const line = [board[a], board[b], board[c]];
    const empty = [a, b, c].find((index) => board[index] === null);
    if (empty !== undefined && line.filter((cell) => cell === mark).length === 2) return empty;
  }

  return null;
}

export function MiniGamesPage() {
  const [activeGame, setActiveGame] = useState<GameTab>('blackjack');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [coins, setCoins] = useState(0);
  const payout = rewardFor(difficulty);

  async function addCoins(amount: number) {
    setCoins((current) => current + amount);
    const next = await localGameService.addMiniGameCoins(amount);
    setCurrencies({
      coins: next.currencies.coins,
      gems: next.currencies.gems,
      energy: next.currencies.energy,
      sprouts: next.currencies.sprouts,
    });
  }

  return (
    <div className="grid gap-5">
      <Card
        title="Mini Games"
        action={<span className="rounded-xl bg-sun px-4 py-2 text-sm font-black text-ink">Won here: {coins} coins</span>}
      >
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveGame(tab.id)}
              className={`overflow-hidden rounded-2xl border-2 text-left shadow-pixel transition hover:-translate-y-0.5 ${
                activeGame === tab.id ? 'border-berry bg-rose-50' : 'border-ink/10 bg-white'
              }`}
            >
              <MiniGameArtwork game={tab.id} />
              <span className="block px-4 pb-4 pt-2 text-sm font-black text-ink">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl rounded-xl bg-cream px-4 py-3 text-sm font-bold leading-relaxed text-ink/70">
            Mini-game wins now add coins to your resource bar. Higher difficulty pays more, but the games are less forgiving.
          </p>
          <div className="grid w-full gap-2 sm:grid-cols-4 lg:w-[280px] lg:grid-cols-1">
            {difficulties.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDifficulty(item.id)}
                className={`rounded-xl border-2 p-3 text-left transition hover:-translate-y-0.5 ${
                  difficulty === item.id ? 'border-berry bg-rose-50 shadow-pixel' : 'border-ink/10 bg-white'
                }`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className="block text-xs font-bold text-ink/60">{item.reward} coins - {item.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {activeGame === 'blackjack' && <BlackjackGame difficulty={difficulty} payout={payout} onWin={addCoins} />}
      {activeGame === 'cups' && <CupGame difficulty={difficulty} payout={payout} onWin={addCoins} />}
      {activeGame === 'tic-tac-toe' && <TicTacToeGame difficulty={difficulty} payout={payout} onWin={addCoins} />}
    </div>
  );
}

function BlackjackGame({ difficulty, payout, onWin }: { difficulty: Difficulty; payout: number; onWin: (amount: number) => void }) {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [isRoundOver, setIsRoundOver] = useState(true);
  const [message, setMessage] = useState('Start a round to deal cards.');

  const playerTotal = handTotal(playerHand);
  const dealerTotal = handTotal(dealerHand);
  const dealerLimit = difficulty === 'easy' ? 16 : 17;

  function startRound() {
    const nextDeck = makeDeck();
    const player = [nextDeck.pop()!, nextDeck.pop()!];
    const dealer = [nextDeck.pop()!, nextDeck.pop()!];

    setDeck(nextDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setIsRoundOver(false);
    setMessage('Hit or stand. Dealer plays after you stand.');
  }

  function hit() {
    const nextDeck = [...deck];
    const nextHand = [...playerHand, nextDeck.pop()!];
    const total = handTotal(nextHand);

    setDeck(nextDeck);
    setPlayerHand(nextHand);

    if (total > 21) {
      setIsRoundOver(true);
      setMessage('Bust. The dealer wins this round.');
    }
  }

  function stand() {
    const nextDeck = [...deck];
    const nextDealer = [...dealerHand];

    while (handTotal(nextDealer) < dealerLimit) {
      nextDealer.push(nextDeck.pop()!);
    }

    const finalDealer = handTotal(nextDealer);
    setDeck(nextDeck);
    setDealerHand(nextDealer);
    setIsRoundOver(true);

    if (finalDealer > 21 || playerTotal > finalDealer) {
      const bonus = playerTotal === 21 && playerHand.length === 2 ? Math.round(payout * 1.5) : payout;
      onWin(bonus);
      setMessage(`You win ${bonus} coins.`);
    } else if (playerTotal === finalDealer) {
      setMessage('Push. Nobody wins coins.');
    } else {
      setMessage('Dealer wins this round.');
    }
  }

  return (
    <Card title="Blackjack">
      <div className="rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-500 via-meadow to-pond p-4 shadow-pixel">
        <div className="mb-4 flex items-center justify-between rounded-xl bg-white/85 px-4 py-3">
          <span className="text-sm font-black text-ink">Farmhouse Card Table</span>
          <span className="text-xs font-black uppercase tracking-wide text-berry">Dealer stands at {dealerLimit}</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
        <Hand title="Your Hand" hand={playerHand} total={playerTotal} />
        <Hand title="Dealer Hand" hand={dealerHand} total={isRoundOver ? dealerTotal : handTotal(dealerHand.slice(0, 1))} hideSecond={!isRoundOver} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={startRound}>{isRoundOver ? 'Deal Round' : 'Restart Round'}</Button>
        <Button type="button" variant="secondary" onClick={hit} disabled={isRoundOver}>Hit</Button>
        <Button type="button" variant="ghost" onClick={stand} disabled={isRoundOver}>Stand</Button>
        <span className="text-sm font-black text-ink/70">Difficulty: {difficulty} - win up to {Math.round(payout * 1.5)} coins</span>
      </div>
      <p className="mt-4 rounded-xl bg-cream p-4 text-sm font-bold text-ink/75">{message}</p>
    </Card>
  );
}

function Hand({ title, hand, total, hideSecond = false }: { title: string; hand: PlayingCard[]; total: number; hideSecond?: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-white/80 bg-cream/95 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black">Total {total}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {hand.map((card, index) => (
          <div key={`${card.suit}-${card.rank}-${index}`} className="relative grid h-28 w-20 place-items-center rounded-xl border-2 border-ink/15 bg-white shadow-pixel">
            <span className={`absolute left-2 top-2 text-xs font-black ${card.suit === 'H' || card.suit === 'D' ? 'text-berry' : 'text-ink'}`}>
              {hideSecond && index === 1 ? '' : card.suit}
            </span>
            <span className={`text-2xl font-black ${card.suit === 'H' || card.suit === 'D' ? 'text-berry' : 'text-ink'}`}>
              {hideSecond && index === 1 ? '?' : card.rank}
            </span>
            <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-sun" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CupGame({ difficulty, payout, onWin }: { difficulty: Difficulty; payout: number; onWin: (amount: number) => void }) {
  const startingCups = { easy: 3, normal: 4, hard: 5, expert: 6 }[difficulty];
  const [level, setLevel] = useState(1);
  const [ballCup, setBallCup] = useState(() => Math.floor(Math.random() * startingCups));
  const [phase, setPhase] = useState<CupPhase>('show');
  const [message, setMessage] = useState('Watch the ball, then start the shuffle.');
  const cupCount = startingCups + level - 1;
  const levelReward = payout + (level - 1) * 25;

  useEffect(() => {
    const nextCupCount = startingCups;
    setLevel(1);
    setBallCup(Math.floor(Math.random() * nextCupCount));
    setPhase('show');
    setMessage('Difficulty changed. Watch the ball, then start the shuffle.');
  }, [startingCups]);

  function reset(nextLevel = 1, nextMessage = 'Watch the ball, then start the shuffle.') {
    const nextCupCount = startingCups + nextLevel - 1;
    setLevel(nextLevel);
    setBallCup(Math.floor(Math.random() * nextCupCount));
    setPhase('show');
    setMessage(nextMessage);
  }

  function startShuffle() {
    setPhase('shuffle');
    setMessage('Shuffling cups...');

    window.setTimeout(() => {
      setBallCup(Math.floor(Math.random() * cupCount));
      setPhase('pick');
      setMessage('Now pick the cup with the berry ball.');
    }, 1800);
  }

  function pickCup(index: number) {
    if (phase !== 'pick') return;

    if (index === ballCup) {
      onWin(levelReward);
      reset(level + 1, `Correct. You won ${levelReward} coins and unlocked another cup.`);
    } else {
      reset(1, `Miss. The ball was under cup ${ballCup + 1}. Progress reset.`);
    }
  }

  return (
    <Card
      title="Cup Game"
      action={<span className="rounded-xl bg-cream px-4 py-2 text-xs font-black">Level {level} - {cupCount} cups - {levelReward} coins</span>}
    >
      <div className="overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-b from-sky-100 to-lime-100 p-4 shadow-pixel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-3">
          <div>
            <h3 className="font-black text-ink">Barnyard Shell Shuffle</h3>
            <p className="text-xs font-bold text-ink/60">The berry ball hides under one cozy cup.</p>
          </div>
          <div className="rounded-full bg-sun px-4 py-2 text-xs font-black">Streak level {level}</div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: cupCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => pickCup(index)}
            disabled={phase !== 'pick'}
            className={`group relative aspect-square rounded-2xl border-4 border-white bg-white/70 p-2 shadow-pixel transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-berry/30 disabled:cursor-not-allowed ${
              phase === 'shuffle' ? `cup-shuffle-${(index % 3) + 1}` : ''
            }`}
            style={phase === 'shuffle' ? { animationDelay: `${index * 80}ms` } : undefined}
            aria-label={`Cup ${index + 1}`}
          >
            {phase === 'show' && index === ballCup && <span className="absolute left-1/2 top-3 z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-berry shadow-pixel" />}
            <CupArtwork variant={index % 4} />
          </button>
        ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={startShuffle} disabled={phase !== 'show'}>Start Shuffle</Button>
        <Button type="button" variant="ghost" onClick={() => reset(1)}>Reset Cups</Button>
        <p className="text-sm font-bold text-ink/70">{message}</p>
      </div>
    </Card>
  );
}

function TicTacToeGame({ difficulty, payout, onWin }: { difficulty: Difficulty; payout: number; onWin: (amount: number) => void }) {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [message, setMessage] = useState('You are X. Pick a square.');
  const result = useMemo(() => winner(board), [board]);

  function reset() {
    setBoard(Array(9).fill(null));
    setMessage('You are X. Pick a square.');
  }

  function choose(index: number) {
    if (board[index] || result) return;

    const playerBoard = [...board];
    playerBoard[index] = 'X';
    const playerResult = winner(playerBoard);

    if (playerResult === 'X') {
      setBoard(playerBoard);
      setMessage(`You win ${payout} coins.`);
      onWin(payout);
      return;
    }

    if (playerResult === 'draw') {
      setBoard(playerBoard);
      setMessage('Draw. Nobody wins coins.');
      return;
    }

    const aiIndex = chooseAiMove(playerBoard, difficulty);
    if (aiIndex !== null) playerBoard[aiIndex] = 'O';

    const finalResult = winner(playerBoard);
    setBoard(playerBoard);

    if (finalResult === 'O') {
      setMessage('AniPal wins this board.');
    } else if (finalResult === 'draw') {
      setMessage('Draw. Nobody wins coins.');
    } else {
      setMessage('Your turn.');
    }
  }

  return (
    <Card title="Tic Tac Toe">
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="grid aspect-square grid-cols-3 gap-3 rounded-2xl border-4 border-white bg-lime-100 p-3 shadow-pixel">
          {board.map((mark, index) => (
            <button
              key={index}
              type="button"
              onClick={() => choose(index)}
              className="grid place-items-center rounded-2xl border-4 border-white bg-cream text-5xl font-black text-ink shadow-pixel transition hover:-translate-y-0.5 disabled:opacity-80"
              disabled={Boolean(mark) || Boolean(result)}
            >
              {mark === 'X' && <span className="grid h-16 w-16 place-items-center rounded-full bg-sun text-4xl text-ink">X</span>}
              {mark === 'O' && <span className="grid h-16 w-16 place-items-center rounded-full bg-pond text-4xl text-white">O</span>}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border-2 border-ink/10 bg-white p-5">
          <h3 className="text-xl font-black">Reward: {payout} coins</h3>
          <p className="mt-3 rounded-xl bg-cream p-4 text-sm font-bold text-ink/75">{message}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>New Board</Button>
            <Button type="button" variant="ghost" onClick={reset}>Clear</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function chooseAiMove(board: Mark[], difficulty: Difficulty) {
  const empty = board.map((cell, index) => (cell ? null : index)).filter((index): index is number => index !== null);
  if (empty.length === 0) return null;

  const winning = bestMove(board, 'O');
  const blocking = bestMove(board, 'X');

  if (difficulty === 'expert' && winning !== null) return winning;
  if ((difficulty === 'hard' || difficulty === 'expert') && blocking !== null) return blocking;
  if ((difficulty === 'hard' || difficulty === 'expert') && board[4] === null) return 4;
  if (difficulty === 'normal' && Math.random() > 0.45 && blocking !== null) return blocking;

  return empty[Math.floor(Math.random() * empty.length)];
}

function MiniGameArtwork({ game }: { game: GameTab }) {
  if (game === 'blackjack') {
    return (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-400 to-pond">
        <div className="absolute inset-x-5 bottom-3 h-12 rounded-full bg-emerald-700/35" />
        <div className="absolute left-8 top-5 h-16 w-12 rotate-[-10deg] rounded-lg border-2 border-white bg-white shadow-pixel">
          <span className="grid h-full place-items-center text-xl font-black text-berry">A</span>
        </div>
        <div className="absolute left-20 top-4 h-16 w-12 rotate-6 rounded-lg border-2 border-white bg-white shadow-pixel">
          <span className="grid h-full place-items-center text-xl font-black text-ink">K</span>
        </div>
        <div className="absolute right-7 top-8 h-10 w-10 rounded-full bg-sun shadow-pixel" />
      </div>
    );
  }

  if (game === 'cups') {
    return (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-sky-100 to-lime-200">
        <div className="absolute bottom-0 h-8 w-full bg-meadow/70" />
        <div className="absolute left-7 top-8"><CupArtwork variant={0} small /></div>
        <div className="absolute left-24 top-6"><CupArtwork variant={1} small /></div>
        <div className="absolute right-8 top-8"><CupArtwork variant={2} small /></div>
      </div>
    );
  }

  return (
    <div className="relative grid h-28 grid-cols-3 gap-2 bg-lime-100 p-4">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="grid place-items-center rounded-lg border-2 border-white bg-cream shadow-pixel">
          {index === 0 || index === 4 ? <span className="font-black text-sun">X</span> : null}
          {index === 2 || index === 6 ? <span className="font-black text-pond">O</span> : null}
        </div>
      ))}
    </div>
  );
}

function CupArtwork({ variant, small = false }: { variant: number; small?: boolean }) {
  const colors = [
    ['from-berry', 'to-rose-400', 'bg-sun'],
    ['from-pond', 'to-cyan-300', 'bg-berry'],
    ['from-meadow', 'to-lime-300', 'bg-pond'],
    ['from-sun', 'to-orange-300', 'bg-meadow'],
  ][variant] ?? ['from-berry', 'to-rose-400', 'bg-sun'];

  return (
    <div className={`relative mx-auto ${small ? 'h-16 w-16' : 'h-full min-h-24 w-full max-w-28'}`}>
      <div className={`absolute left-1/2 top-[18%] h-5 w-5 -translate-x-1/2 rounded-full ${colors[2]} shadow-pixel`} />
      <div className={`absolute inset-x-[14%] bottom-[14%] top-[24%] rounded-b-3xl rounded-t-xl bg-gradient-to-b ${colors[0]} ${colors[1]} shadow-pixel`} />
      <div className="absolute inset-x-[8%] top-[18%] h-[18%] rounded-full border-4 border-white/70 bg-white/55" />
      <div className="absolute left-[29%] top-[39%] h-[14%] w-[13%] rounded-full bg-white/60" />
      <div className="absolute right-[22%] top-[36%] h-[32%] w-[10%] rounded-full bg-white/30" />
      <div className="absolute inset-x-[20%] bottom-[8%] h-[10%] rounded-full bg-ink/15" />
    </div>
  );
}
