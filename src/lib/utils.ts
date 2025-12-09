import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export const THEME_COLORS = {
  light: '#f9fafb', // Tailwind gray-50
  dark: '#101828', // Tailwind gray-900
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;

export const magicLinkLoginSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(3, 'username must be at least 3 characters'),
});

export type MagicLinkCredentials = z.infer<typeof magicLinkLoginSchema>;
