import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

const variants = {
  primary: 'bg-berry text-white border-rose-700 hover:-translate-y-0.5 hover:bg-rose-500',
  secondary: 'bg-sun text-ink border-amber-600 hover:-translate-y-0.5 hover:bg-yellow-300',
  ghost: 'bg-white/70 text-ink border-ink/15 hover:bg-white',
  danger: 'bg-red-400 text-white border-red-700 hover:-translate-y-0.5 hover:bg-red-500',
};

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg border-2 px-4 py-2 text-sm font-black shadow-pixel transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
