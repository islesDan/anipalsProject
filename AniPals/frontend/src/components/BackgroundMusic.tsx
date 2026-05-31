import { useState } from 'react';

const youtubeVideoId = 'uDY69Zp4sMk';
const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&playsinline=1`;

export function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {playing && (
        <iframe
          className="h-0 w-0 border-0"
          title="AniPals background music"
          src={youtubeEmbedUrl}
          allow="autoplay; encrypted-media"
        />
      )}
      <button
        type="button"
        onClick={() => setPlaying((current) => !current)}
        className="rounded-2xl border-4 border-sun bg-ink px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-soft transition hover:-translate-y-0.5"
      >
        Music {playing ? 'On' : 'Off'}
      </button>
    </div>
  );
}
