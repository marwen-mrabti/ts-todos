import { Button } from '@/components/ui/button';
import { useMagicLink } from '@/hooks/useMagicLink';
import type { MagicLinkCredentials } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Mail } from 'lucide-react';

export function ResendMagicLinkButton({ email, name }: MagicLinkCredentials) {
  const navigate = useNavigate();
  const { sendMagicLink, pending, cooldown, formatCooldown } = useMagicLink();

  const handleResendMagicLink = async () => {
    if (!email || !name) {
      return navigate({ to: '/login' });
    }

    const result = await sendMagicLink({ email, name });

    if (result.success && window.location.pathname !== '/check-email') {
      navigate({
        to: '/check-email',
        search: {
          email,
          name,
        },
      });
    }
  };

  return (
    <Button
      variant="default"
      className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
      disabled={pending || cooldown > 0}
      onClick={handleResendMagicLink}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      {pending
        ? 'Sending...'
        : cooldown > 0
          ? `Resend available in ${formatCooldown(cooldown)}`
          : 'Resend Magic Link'}
    </Button>
  );
}
