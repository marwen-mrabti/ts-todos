import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';

import { ResendMagicLinkButton } from '@/components/auth/resend-magic-link';
import { magicLinkLoginSchema } from '@/lib/utils';
import { zodValidator } from '@tanstack/zod-adapter';

export const Route = createFileRoute('/_auth/check-email')({
  validateSearch: zodValidator(magicLinkLoginSchema),
  component: RouteComponent,
});

function RouteComponent() {
  const { email, name } = Route.useSearch();

  return (
    <div className="from-background to-muted flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
                <Mail className="text-primary h-10 w-10" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 dark:bg-green-600">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <CardTitle className="mb-2 text-3xl">Check Your Email</CardTitle>

          <CardDescription className="text-base">
            We've sent a magic link to your inbox. Click the link in the email
            to sign in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <p className="mb-2 font-medium">Didn't receive the email?</p>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and refresh your inbox</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Gmail
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://outlook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Outlook
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://mail.proton.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Proton
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://mail.yahoo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yahoo
                </a>
              </Button>
            </div>

            <ResendMagicLinkButton email={email} name={name} />
          </div>

          <p className="text-muted-foreground text-center text-xs">
            The link will expire in 30 minutes for security purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
