import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CheckCircle, Mail } from 'lucide-react'

import { ResendMagicLinkButton } from '@/components/auth/resend-magic-link'

export const Route = createFileRoute('/_auth/check-email')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <CardTitle className="text-3xl mb-2">
            Check Your Email
          </CardTitle>

          <CardDescription className="text-base">
            We've sent a magic link to your inbox. Click the link in the email to sign in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">
                Didn't receive the email?
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and refresh your inbox</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full"
              size="lg"
            >
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Gmail
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a
                  href="https://outlook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Outlook
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a
                  href="https://mail.proton.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Proton
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <a
                  href="https://mail.yahoo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yahoo
                </a>
              </Button>
            </div>

            <ResendMagicLinkButton />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            The link will expire in 30 minutes for security purposes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}