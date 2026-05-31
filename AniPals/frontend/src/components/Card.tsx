import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-2xl border-4 border-white bg-white/90 p-5 shadow-soft ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-black text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
