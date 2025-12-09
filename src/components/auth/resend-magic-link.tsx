import { Button } from "@/components/ui/button";
import { useMagicLink } from "@/hooks/useMagicLink";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";

export function ResendMagicLinkButton() {
  const navigate = useNavigate();
  const {
    sendMagicLink,
    getStoredCredentials,
    pending,
    cooldown,
    formatCooldown
  } = useMagicLink();

  const handleResendMagicLink = async () => {
    const credentials = getStoredCredentials();

    if (!credentials) {
      navigate({ to: "/login" });
      return;
    }

    const result = await sendMagicLink(credentials);

    if (result.success && window.location.pathname !== "/check-email") {
      navigate({ to: "/check-email" });
    }
  };

  return (
    <Button
      variant="default"
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      disabled={pending || cooldown > 0}
      onClick={handleResendMagicLink}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Mail className="w-4 h-4 mr-2" />
      )}
      {pending
        ? "Sending..."
        : cooldown > 0
          ? `Resend available in ${formatCooldown(cooldown)}`
          : "Resend Magic Link"}
    </Button>
  );
}