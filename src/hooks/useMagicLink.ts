import type { MagicLinkCredentials } from '@/lib/utils';
import { signInWithMagicLink } from '@/server/auth.actions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const COOLDOWN_KEY = 'magiclink_last_sent';
const COOLDOWN_MINUTES = 10;

export function useMagicLink() {
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Initialize cooldown on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lastSent = localStorage.getItem(COOLDOWN_KEY);
    if (lastSent) {
      const secondsPassed = Math.floor((Date.now() - +lastSent) / 1000);
      const remaining = COOLDOWN_MINUTES * 60 - secondsPassed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const sendMagicLink = useCallback(
    async (credentials: MagicLinkCredentials) => {
      if (cooldown > 0) {
        toast.info('Please wait before requesting another link');
        return { success: false, error: 'Cooldown active' };
      }

      setPending(true);

      try {
        const data = await signInWithMagicLink({
          data: credentials,
        });

        if (!data.success) {
          throw new Error(data.error);
        }

        // Store credentials and timestamp
        if (typeof window !== 'undefined') {
          localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
        }

        setCooldown(COOLDOWN_MINUTES * 60);
        toast.success('Magic link sent! Check your email.');

        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error(message, {
          description:
            'it is us! this error is from the server. please try again later',
          position: 'top-right',
          duration: 3000,
          classNames: {
            content: 'w-sm flex flex-col gap-2 p-2',
            description: 'text-xs text-card-foreground!',
          },
          style: {
            '--border-radius': 'calc(var(--radius) + 4px)',
          } as React.CSSProperties,
        });
        return { success: false, error: message };
      } finally {
        setPending(false);
      }
    },
    [cooldown]
  );

  const formatCooldown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  return {
    pending,
    cooldown,
    sendMagicLink,
    formatCooldown,
    isOnCooldown: cooldown > 0,
  };
}
