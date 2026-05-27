import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, className = '', ...props }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <input
        className={`w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-ink outline-none transition focus:border-pond focus:ring-4 focus:ring-pond/20 ${className}`}
        {...props}
      />
    </label>
  );
}
