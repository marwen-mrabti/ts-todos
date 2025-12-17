import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useMagicLink } from '@/hooks/useMagicLink';
import { authClient } from '@/lib/auth/auth-client';
import { cn, magicLinkLoginSchema } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { sendMagicLink, pending, cooldown, formatCooldown } = useMagicLink();
  const [socialSignInPending, setSocialSignInPending] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      name: '',
    },
    validators: {
      onSubmit: magicLinkLoginSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await sendMagicLink({
        email: value.email,
        name: value.name,
      });

      if (result.success) {
        return navigate({
          to: '/check-email',
          search: {
            email: value.email,
            name: value.name,
          },
        });
      }
    },
  });

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setSocialSignInPending(true);

    // Set a timeout to detect if the user gets stuck
    const timeoutId = setTimeout(() => {
      setSocialSignInPending(false);
      toast.error('Authentication took too long. Please try again.');
    }, 30000);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/todos',
        errorCallbackURL: '/error',
        newUserCallbackURL: '/onboarding',
        fetchOptions: {
          onError: (ctx) => {
            clearTimeout(timeoutId);
            toast.error(ctx.error.message);
            navigate({
              to: '/error',
              search: {
                error: ctx.error.message,
                type: 'social',
              },
            });
          },
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      toast.error('Authentication failed');
    } finally {
      clearTimeout(timeoutId);
      setSocialSignInPending(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your GitHub or MagicLink</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <Field>
                <Button
                  onClick={() => handleSocialSignIn('github')}
                  variant="outline"
                  type="button"
                >
                  {socialSignInPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2.0-.21.15-.46.55-.38C13.71 14.53 16 11.53 16 8c0-4.42-3.58-8-8-8" />
                    </svg>
                  )}
                  Login with GitHub
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with MagicLink
                <small className="text-muted-foreground mx-1 text-xs">
                  [we will send you an email with a link to login]
                </small>
              </FieldSeparator>

              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="joe"
                        autoComplete="on"
                        type="text"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="m@example.com"
                        autoComplete="on"
                        type="email"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <Field>
                <Button type="submit" disabled={pending || cooldown > 0}>
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {pending
                    ? 'Sending...'
                    : cooldown > 0
                      ? `Wait ${formatCooldown(cooldown)}`
                      : 'Send Magic Link'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
