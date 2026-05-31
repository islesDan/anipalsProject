type PixelAvatarProps = {
  name: string;
  palette: string;
  species?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

export function PixelAvatar({ name, palette, species, size = 'md' }: PixelAvatarProps) {
  const initial = name.slice(0, 1).toUpperCase();
  const animal = (species ?? '').trim().toLowerCase();

  return (
    <div className={`${sizes[size]} relative overflow-hidden rounded-2xl border-4 border-white ${palette} shadow-pixel`}>
      {animal === 'cat'    && <CatAvatar initial={initial} />}
      {animal === 'turtle' && <TurtleAvatar initial={initial} />}
      {animal !== 'cat' && animal !== 'turtle' && <BunnyAvatar initial={initial} />}
    </div>
  );
}

function BunnyAvatar({ initial }: { initial: string }) {
  return (
    <>
      {/* Long ears */}
      <div className="absolute left-[22%] top-[-22%] h-[36%] w-[16%] rounded-full bg-white/80" />
      <div className="absolute right-[22%] top-[-22%] h-[36%] w-[16%] rounded-full bg-white/80" />
      <div className="absolute left-[24%] top-[-18%] h-[28%] w-[10%] rounded-full bg-berry/50" />
      <div className="absolute right-[24%] top-[-18%] h-[28%] w-[10%] rounded-full bg-berry/50" />
      {/* Face */}
      <div className="absolute left-1/2 top-[18%] h-[56%] w-[64%] -translate-x-1/2 rounded-full bg-cream shadow-pixel" />
      {/* Eyes */}
      <div className="absolute left-[27%] top-[38%] h-[12%] w-[12%] rounded-full bg-berry" />
      <div className="absolute right-[27%] top-[38%] h-[12%] w-[12%] rounded-full bg-berry" />
      <div className="absolute left-[29%] top-[39%] h-[4%] w-[4%] rounded-full bg-white/80" />
      <div className="absolute right-[29%] top-[39%] h-[4%] w-[4%] rounded-full bg-white/80" />
      {/* Nose */}
      <div className="absolute left-1/2 top-[50%] h-[7%] w-[12%] -translate-x-1/2 rounded-full bg-berry/80" />
      {/* Whiskers */}
      <div className="absolute left-[8%] top-[53%] h-[2%] w-[26%] rounded-full bg-white/50" />
      <div className="absolute left-[8%] top-[58%] h-[2%] w-[24%] rounded-full bg-white/50" />
      <div className="absolute right-[8%] top-[53%] h-[2%] w-[26%] rounded-full bg-white/50" />
      <div className="absolute right-[8%] top-[58%] h-[2%] w-[24%] rounded-full bg-white/50" />
      {/* Mouth */}
      <div className="absolute left-1/2 top-[57%] h-[2%] w-[18%] -translate-x-1/2 rounded-full bg-berry/70" />
      {/* Name tag */}
      <div className="absolute bottom-0 left-0 right-0 grid h-[26%] place-items-center bg-white/70 text-xs font-black text-ink">
        {initial}
      </div>
    </>
  );
}

function CatAvatar({ initial }: { initial: string }) {
  return (
    <>
      {/* Pointy ears */}
      <div className="absolute left-[10%] top-[2%] h-[22%] w-[20%] rotate-[-15deg] rounded-sm bg-white/80" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute right-[10%] top-[2%] h-[22%] w-[20%] rotate-[15deg] rounded-sm bg-white/80" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute left-[13%] top-[5%] h-[14%] w-[13%] rotate-[-15deg] bg-berry/40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute right-[13%] top-[5%] h-[14%] w-[13%] rotate-[15deg] bg-berry/40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      {/* Face */}
      <div className="absolute left-1/2 top-[18%] h-[56%] w-[64%] -translate-x-1/2 rounded-full bg-cream shadow-pixel" />
      {/* Eyes with slit pupils */}
      <div className="absolute left-[24%] top-[36%] h-[14%] w-[14%] rounded-full bg-green-400" />
      <div className="absolute right-[24%] top-[36%] h-[14%] w-[14%] rounded-full bg-green-400" />
      <div className="absolute left-[29%] top-[36%] h-[14%] w-[4%] rounded-full bg-ink" />
      <div className="absolute right-[29%] top-[36%] h-[14%] w-[4%] rounded-full bg-ink" />
      <div className="absolute left-[26%] top-[37%] h-[4%] w-[4%] rounded-full bg-white/70" />
      <div className="absolute right-[26%] top-[37%] h-[4%] w-[4%] rounded-full bg-white/70" />
      {/* Nose */}
      <div className="absolute left-1/2 top-[50%] h-[7%] w-[12%] -translate-x-1/2 rounded-full bg-amber-400/80" />
      {/* Whiskers */}
      <div className="absolute left-[4%] top-[52%] h-[2%] w-[30%] rounded-full bg-white/50" />
      <div className="absolute left-[4%] top-[57%] h-[2%] w-[28%] rounded-full bg-white/50" />
      <div className="absolute right-[4%] top-[52%] h-[2%] w-[30%] rounded-full bg-white/50" />
      <div className="absolute right-[4%] top-[57%] h-[2%] w-[28%] rounded-full bg-white/50" />
      {/* Mouth */}
      <div className="absolute left-1/2 top-[57%] h-[2%] w-[16%] -translate-x-1/2 rounded-full bg-amber-600/60" />
      <div className="absolute left-[42%] top-[57%] h-[6%] w-[2%] rounded-full bg-amber-600/60" />
      <div className="absolute right-[42%] top-[57%] h-[6%] w-[2%] rounded-full bg-amber-600/60" />
      {/* Name tag */}
      <div className="absolute bottom-0 left-0 right-0 grid h-[26%] place-items-center bg-white/70 text-xs font-black text-ink">
        {initial}
      </div>
    </>
  );
}

function TurtleAvatar({ initial }: { initial: string }) {
  return (
    <>
      {/* Shell pattern on top */}
      <div className="absolute inset-x-2 top-0 h-[24%] rounded-b-full bg-green-700/70" />
      <div className="absolute left-[18%] top-[2%] h-[12%] w-[18%] rounded-full bg-green-900/50" />
      <div className="absolute left-[41%] top-[1%] h-[13%] w-[18%] rounded-full bg-green-900/50" />
      <div className="absolute right-[18%] top-[2%] h-[12%] w-[18%] rounded-full bg-green-900/50" />
      {/* Face */}
      <div className="absolute left-1/2 top-[20%] h-[54%] w-[64%] -translate-x-1/2 rounded-full shadow-pixel" style={{ background: '#d1fae5' }} />
      {/* Eyes */}
      <div className="absolute left-[27%] top-[38%] h-[12%] w-[12%] rounded-full bg-green-900" />
      <div className="absolute right-[27%] top-[38%] h-[12%] w-[12%] rounded-full bg-green-900" />
      <div className="absolute left-[29%] top-[39%] h-[4%] w-[4%] rounded-full bg-white/80" />
      <div className="absolute right-[29%] top-[39%] h-[4%] w-[4%] rounded-full bg-white/80" />
      {/* Nostrils */}
      <div className="absolute left-[40%] top-[52%] h-[5%] w-[6%] rounded-full bg-green-700/60" />
      <div className="absolute right-[40%] top-[52%] h-[5%] w-[6%] rounded-full bg-green-700/60" />
      {/* Calm wide smile */}
      <div className="absolute left-1/2 top-[57%] h-[5%] w-[36%] -translate-x-1/2 rounded-full bg-green-700/70" />
      <div className="absolute left-1/2 top-[58%] h-[4%] w-[32%] -translate-x-1/2 rounded-full" style={{ background: '#6ee7b7' }} />
      {/* Name tag */}
      <div className="absolute bottom-0 left-0 right-0 grid h-[26%] place-items-center bg-white/70 text-xs font-black text-ink">
        {initial}
      </div>
    </>
  );
}