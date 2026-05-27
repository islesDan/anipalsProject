type PixelAvatarProps = {
  name: string;
  palette: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

export function PixelAvatar({ name, palette, size = 'md' }: PixelAvatarProps) {
  return (
    <div className={`${sizes[size]} pixel-corners border-4 border-white ${palette} shadow-pixel`}>
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-1">
        <span className="col-start-1 row-start-1 bg-white/50" />
        <span className="col-start-3 row-start-1 bg-white/50" />
        <span className="col-start-1 row-start-2 bg-ink/70" />
        <span className="col-start-3 row-start-2 bg-ink/70" />
        <span className="col-span-3 col-start-1 row-start-3 bg-white/60 text-center text-[10px] font-black leading-4 text-ink">
          {name.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
