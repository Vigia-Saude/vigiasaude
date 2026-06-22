import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(value: number | string): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function maskCurrencyBRL(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  const amount = parseInt(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function parseCurrencyBRL(value: string): number {
  return parseInt(value.replace(/\D/g, '')) / 100 || 0;
}

export function formatCPF(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const truncated = digits.slice(0, 11);
  if (truncated.length <= 3) return truncated;
  if (truncated.length <= 6) return `${truncated.slice(0, 3)}.${truncated.slice(3)}`;
  if (truncated.length <= 9) return `${truncated.slice(0, 3)}.${truncated.slice(3, 6)}.${truncated.slice(6)}`;
  return `${truncated.slice(0, 3)}.${truncated.slice(3, 6)}.${truncated.slice(6, 9)}-${truncated.slice(9, 11)}`;
}

