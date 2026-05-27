import type { ReactNode } from 'react';
import farmPreview from '../assets/farm-preview.svg';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-cream pixel-grid px-4 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border-4 border-white bg-white/70 shadow-soft lg:grid-cols-[1fr_440px]">
          <section className="relative hidden min-h-[620px] bg-gradient-to-br from-meadow via-lime-200 to-pond p-8 lg:block">
            <img
              src={farmPreview}
              alt="Pixel farm preview"
              className="absolute inset-x-8 bottom-8 h-auto max-h-[360px] w-[calc(100%-4rem)] rounded-2xl border-4 border-white object-cover shadow-pixel"
            />
            <div className="relative z-10 max-w-lg">
              <p className="text-sm font-black uppercase tracking-wide text-white/85">Multiplayer Pixel Farm</p>
              <h1 className="mt-3 text-6xl font-black leading-none text-white drop-shadow">AniPals</h1>
              <p className="mt-5 text-lg font-bold text-white/90">
                Grow crops, trade with friends, and collect helper companions across a bright shared farm world.
              </p>
            </div>
          </section>
          <section className="p-6 sm:p-10">{children}</section>
        </div>
      </div>
    </main>
  );
}
