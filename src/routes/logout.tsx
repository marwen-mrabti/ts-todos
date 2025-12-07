import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export const Route = createFileRoute("/logout")({
  loader: async () => {
    await authClient.signOut();
    throw redirect({ to: "/" });
  },
  component: SignOutPage,
});

function SignOutPage() {
  const navigate = useNavigate({ from: "/logout" });
  // Client fallback: if JS runs, also logout + redirect
  useEffect(() => {
    authClient.signOut().finally(() => {
      navigate({ to: "/" });
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="w-full max-w-sm shadow-xl border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Signing you out...
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4">
            <LogOut className="h-10 w-10 text-muted-foreground animate-pulse" />

            <p className="text-sm text-muted-foreground text-center">
              Please wait a moment while we log you out.
            </p>

            {/* Fallback button if auto-logout fails */}
            <Button
              variant="secondary"
              onClick={() => {
                authClient.signOut().finally(() => {
                  navigate({ to: "/" });
                });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out Manually
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
