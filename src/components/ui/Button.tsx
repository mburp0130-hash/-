import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'text';

const styles: Record<Variant, string> = {
  primary:
    'w-full h-14 rounded-xl bg-accent text-[#111] font-bold t-body tracking-wide disabled:bg-surface-2 disabled:text-dim',
  secondary: 'w-full h-12 rounded-xl border border-line bg-transparent text-ink t-body-sm',
  text: 'min-h-11 px-3 text-muted t-body-sm',
};

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`pressable ${styles[variant]} ${className}`} {...rest} />;
}
