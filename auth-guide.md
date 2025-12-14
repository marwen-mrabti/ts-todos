# 🔐 Authentication Guide

This guide provides a comprehensive overview of the authentication system in the TanStack Todos application, built with [Better Auth](https://www.better-auth.com/).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication Methods](#authentication-methods)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Implementation Details](#implementation-details)
- [Route Protection](#route-protection)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Overview

The application uses **Better Auth** as its authentication solution, providing:

- 🔑 **GitHub OAuth** - Social authentication via GitHub
- ✉️ **Magic Link** - Passwordless authentication via email
- 🔒 **Session Management** - Secure session handling with cookies
- 🛡️ **Route Protection** - Middleware-based route guards
- 📊 **Database Integration** - PostgreSQL with Drizzle ORM

## Architecture

```mermaid
graph TD
    A[User] -->|Login Request| B[Login Form]
    B -->|GitHub OAuth| C[Better Auth]
    B -->|Magic Link| D[Server Function]
    D -->|Send Email| E[SMTP Service]
    E -->|Magic Link Email| A
    A -->|Click Link| C
    C -->|Verify & Create Session| F[Database]
    F -->|Session Cookie| G[Protected Routes]
    G -->|Access Granted| H[Application]
```

## Authentication Methods

### 1. GitHub OAuth

GitHub OAuth allows users to sign in using their GitHub account.

**Flow:**

1. User clicks "Login with GitHub"
2. Redirected to GitHub authorization page
3. User approves access
4. GitHub redirects back with authorization code
5. Better Auth exchanges code for user info
6. Session created and user redirected to `/todos`

**Configuration:**

- Requires GitHub OAuth App credentials
- Set up at [GitHub Developer Settings](https://github.com/settings/developers)

### 2. Magic Link (Passwordless)

Magic Link provides passwordless authentication via email.

**Flow:**

1. User enters email and name
2. Server generates a unique token
3. Email sent with magic link (valid for 30 minutes)
4. User clicks link in email
5. Token verified and session created
6. User redirected to `/todos` (existing users) or `/onboarding` (new users)

**Features:**

- ⏱️ 10-minute cooldown between requests
- ⏳ 30-minute link expiration
- 🔄 Resend functionality
- 📧 Beautiful HTML email template

## Database Schema

The authentication system uses four main tables:

### Users Table

```typescript
{
  id: text (primary key)
  name: text (required)
  email: text (unique, required)
  emailVerified: boolean (default: false)
  image: text (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Sessions Table

```typescript
{
  id: text (primary key)
  expiresAt: timestamp (required)
  token: text (unique, required)
  ipAddress: text (optional)
  userAgent: text (optional)
  userId: text (foreign key -> users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Accounts Table

Stores OAuth provider information:

```typescript
{
  id: text (primary key)
  accountId: text (required)
  providerId: text (required) // e.g., "github"
  userId: text (foreign key -> users.id)
  accessToken: text (optional)
  refreshToken: text (optional)
  idToken: text (optional)
  accessTokenExpiresAt: timestamp (optional)
  refreshTokenExpiresAt: timestamp (optional)
  scope: text (optional)
  password: text (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Verifications Table

Stores magic link tokens:

```typescript
{
  id: text (primary key)
  identifier: text (required) // email address
  value: text (required) // token
  expiresAt: timestamp (required)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Base URL
BASE_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=ts_todos
DB_PORT=5432
DATABASE_URL=postgresql://postgres:your_db_password@localhost:5432/ts_todos

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email SMTP Configuration (for magic link)
SMTP_SERVICE="gmail"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Node Environment
NODE_ENV=development
```

**Environment Validation** ([`src/lib/env.ts`](./src/lib/env.ts)):

All environment variables are validated at runtime using Zod:

```typescript
const envSchema = z.object({
  BASE_URL: z.url().default('http://localhost:3000'),

  // Database Configuration
  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.url(),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(1),
  AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email SMTP Configuration
  SMTP_SERVICE: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().catch(465),
  SMTP_USER: z.email(),
  SMTP_PASSWORD: z.string().min(1),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = validateWithPretty(envSchema, process.env);
```

This ensures type-safe access to environment variables throughout the application.

### Better Auth Setup

The auth configuration is located in [`src/lib/auth/auth.ts`](./src/lib/auth/auth.ts):

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BASE_URL,

  trustedOrigins: [
    env.BASE_URL,
    'http://localhost:33269',
    'http://localhost:4173',
    'http://localhost:3000',
  ],

  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID!,
      clientSecret: env.AUTH_GITHUB_CLIENT_SECRET!,
    },
  },

  advanced: {
    cookiePrefix: 'ts-auth',
  },

  onAPIError: {
    throw: true,
    onError: (error, _ctx) => {
      const err = error as APIError;
      throw new APIError('INTERNAL_SERVER_ERROR', {
        status: err.status || 500,
        message: err.message || 'Internal Server Error',
      });
    },
    errorURL: '/error',
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Send welcome email to new users after sign-up
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          void sendWelcomeEmail({
            email: newSession.user.email,
            name: newSession.user.name,
          });
        }
      }
      // Handle session retrieval
      else if (ctx.path === '/get-session') {
        if (!ctx.context.session) {
          return ctx.json({
            session: null,
            user: null,
          });
        }
        return ctx.json(ctx.context.session);
      }
    }),
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 30, // 30 minutes in seconds
      sendMagicLink: async ({ email, url }) => {
        void sendEmailWithMagicLink({
          email,
          url,
        });
      },
    }),
    tanstackStartCookies(), // this needs to be the last plugin
  ],

  logger: {
    enabled: true,
    level: 'debug',
  },
});
```

**Key Features:**

- **Database Adapter**: Uses Drizzle ORM with PostgreSQL
- **Trusted Origins**: Configured for local development and production
- **Error Handling**: Custom error handling with redirect to `/error` page
- **Hooks**: Automatically sends welcome emails to new users
- **Cookie Prefix**: Custom prefix for auth cookies (`ts-auth`)
- **Logging**: Debug logging enabled for development

### Client Setup

The auth client is configured in [`src/lib/auth-client.ts`](./src/lib/auth-client.ts):

```typescript
export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [magicLinkClient()],
});
```

## Implementation Details

### API Route Handler

All auth requests are handled through a catch-all route at [`src/routes/api/auth/$.ts`](./src/routes/api/auth/$.ts):

```typescript
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

This handles all Better Auth endpoints:

- `/api/auth/sign-in/social`
- `/api/auth/sign-in/magic-link`
- `/api/auth/callback/magic-link`
- `/api/auth/get-session`
- `/api/auth/sign-out`

### Server Functions

#### Auth Queries

[`src/serverFns/auth.queries.ts`](./src/serverFns/auth.queries.ts):

```typescript
// Get current authenticated user
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    return session?.user;
  }
);
```

#### Auth Actions

[`src/serverFns/auth.actions.ts`](./src/serverFns/auth.actions.ts):

```typescript
// Send magic link email
export const signInWithMagicLink = createServerFn({ method: 'POST' })
  .inputValidator((data) => validateWithPretty(magicLinkLoginSchema, data))
  .handler(async ({ data }) => {
    const response = await auth.api.signInMagicLink({
      body: {
        email: data.email,
        name: data.name,
        callbackURL: '/todos',
        newUserCallbackURL: '/onboarding',
        errorCallbackURL: '/error',
      },
    });
    return { success: true, data: response };
  });
```

### Email Service

The email service uses Nodemailer to send magic link emails via SMTP.

**Configuration** ([`src/serverFns/emails/send-email.ts`](./src/serverFns/emails/send-email.ts)):

```typescript
const createTransporter = () => {
  const port = env.SMTP_PORT;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
};
```

**Email Validation and Sending** ([`src/serverFns/emails/send-email.ts`](./src/serverFns/emails/send-email.ts)):

```typescript
const sendEmailInputSchema = z.object({
  to: z.email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
});

export async function sendEmail(data: SendEmailInput) {
  const transporter = createTransporter();
  await transporter.verify();

  const mailOptions = {
    from: env.SMTP_USER,
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    success: true,
    messageId: info.messageId,
    response: info.response,
  };
}
```

**Magic Link Email Template** ([`src/serverFns/emails/send-magicLink.ts`](./src/serverFns/emails/send-magicLink.ts)):

```typescript
const sendMagicLinkInputSchema = z.object({
  email: z.email(),
  url: z.url(),
});

export async function sendEmailWithMagicLink(data: {
  email: string;
  url: string;
}) {
  const validated = validateWithPretty(sendMagicLinkInputSchema, data);

  await sendEmail({
    to: validated.email,
    subject: 'Sign in to your account',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${emailColors.background};">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: ${emailColors.foreground}; margin-bottom: 24px;">Sign in to your account</h2>
            <p style="color: ${emailColors.mutedForeground}; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              Click the button below to securely sign in. This link will expire in 30 minutes.
            </p>
            <a href="${validated.url}"
               style="display: inline-block; background: ${emailColors.primary}; color: ${emailColors.primaryForeground}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In
            </a>
            <p style="color: ${emailColors.mutedForeground}; font-size: 14px; margin-top: 32px; line-height: 1.5;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <p style="color: ${emailColors.mutedForeground}; font-size: 12px; margin-top: 24px; opacity: 0.7;">
              Or copy and paste this URL: ${validated.url}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Sign in to your account\n\nClick this link to sign in: ${validated.url}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
  });

  return { success: true };
}
```

The email includes:

- Professional HTML template with color theming
- Clear call-to-action button
- Plain text fallback
- Security notice (30-minute expiration)
- Fallback URL for manual copy/paste

**Welcome Email Template** ([`src/serverFns/emails/send-welcome-email.ts`](./src/serverFns/emails/send-welcome-email.ts)):

The application also sends a welcome email to new users after successful sign-up:

```typescript
const sendWelcomeEmailSchema = z.object({
  email: z.email(),
  name: z.string(),
});

export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
}) => {
  const validated = validateWithPretty(sendWelcomeEmailSchema, data);

  await sendEmail({
    to: validated.email,
    subject: 'Welcome to our app',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${emailColors.background}; color: ${emailColors.foreground};">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: ${emailColors.primary};">Welcome to Our App!</h2>
            <p>Hello ${validated.name},</p>
            <p>Thank you for signing up for our app! We're excited to have you on board.</p>
            <p>Best regards,<br>Your App Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Hello ${validated.name},\n\nThank you for signing up for our app! We're excited to have you on board.\n\nBest regards,\nYour App Team`,
  });
  return { success: true };
};
```

**Email Color Theming** ([`src/serverFns/emails/email-colors.ts`](./src/serverFns/emails/email-colors.ts)):

All email templates use a consistent color scheme defined in a central location for easy customization.

## Route Protection

### Middleware

Two middleware functions handle authentication:

#### 1. Route Middleware

[`src/middleware/auth-middleware.ts`](./src/middleware/auth-middleware.ts):

```typescript
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.session || !session.user) {
      throw redirect({ to: '/login' });
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);
```

#### 2. Server Function Middleware

```typescript
export const serverFnAuthMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.session || !session.user) {
    throw new Error('Unauthorized');
  }

  return next({
    sendContext: {
      session: session.session,
      user: session.user,
    },
  });
});
```

### Protected Routes

#### Root Route Context

[`src/routes/__root.tsx`](./src/routes/__root.tsx):

The root route loads the current user and makes it available to all child routes:

```typescript
export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user) {
      await deleteMagicLinkData();
      removeDataFromLocalStorage([COOLDOWN_KEY]);
    }
    return { user };
  },
});
```

#### Auth Routes (Public)

[`src/routes/_auth.tsx`](./src/routes/_auth.tsx):

Routes under `_auth` are public but redirect authenticated users:

```typescript
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context;
    if (user) {
      throw redirect({
        to: '/todos',
        search: { redirect: location.href },
      });
    }
  },
});
```

**Public routes:**

- `/login` - Login page
- `/check-email` - Email verification page
- `/error` - Auth error page

#### Protected Routes

[`src/routes/_authed.tsx`](./src/routes/_authed.tsx):

Routes under `_authed` require authentication:

```typescript
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const user = context.user;
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
    return { user };
  },
});
```

**Protected routes:**

- `/todos` - Main todos page
- `/todos/*` - All todo-related pages

## Usage Examples

### 1. GitHub OAuth Sign-In

```typescript
import { authClient } from '@/lib/auth-client';

const handleGitHubSignIn = async () => {
  await authClient.signIn.social({
    provider: 'github',
    callbackURL: '/todos',
    fetchOptions: {
      onError: (ctx) => {
        toast.error(ctx.error.message);
      },
    },
  });
};
```

### 2. Magic Link Sign-In

```typescript
import { useMagicLink } from '@/hooks/useMagicLink';

function LoginForm() {
  const { sendMagicLink, pending, cooldown } = useMagicLink();

  const handleSubmit = async (values) => {
    const result = await sendMagicLink({
      email: values.email,
      name: values.name,
    });

    if (result.success) {
      navigate({ to: '/check-email' });
    }
  };
}
```

### 3. Get Current User

```typescript
import { getCurrentUser } from '@/serverFns/auth.queries';

// In a server function or route loader
const user = await getCurrentUser();
```

### 4. Sign Out

```typescript
import { authClient } from '@/lib/auth-client';

const handleSignOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        navigate({ to: '/login' });
      },
    },
  });
};
```

### 5. Access User in Protected Route

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/todos')({
  component: TodosPage,
});

function TodosPage() {
  const { user } = Route.useRouteContext();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

## Custom Hooks

### useMagicLink

[`src/hooks/useMagicLink.ts`](./src/hooks/useMagicLink.ts):

A custom hook that handles magic link authentication with cooldown management:

```typescript
const {
  sendMagicLink, // Function to send magic link
  pending, // Loading state
  cooldown, // Remaining cooldown seconds
  formatCooldown, // Format cooldown as MM:SS
  isOnCooldown, // Boolean cooldown state
} = useMagicLink();
```

**Features:**

- 10-minute cooldown between requests
- Persists cooldown in localStorage
- Countdown timer
- Toast notifications

## Troubleshooting

### Common Issues

#### 1. Magic Link Not Received

**Possible causes:**

- SMTP credentials incorrect
- Email in spam folder
- SMTP port blocked by firewall
- SMTP server connection issues
- Email validation failed

**Solutions:**

1. **Verify SMTP environment variables:**
   - Check all SMTP variables are set in `.env`
   - Ensure `SMTP_USER` is a valid email address
   - Verify `SMTP_PASSWORD` is correct

2. **Check email delivery:**
   - Look in spam/junk folder
   - Check email server logs for errors
   - Verify sender email is not blacklisted

3. **Try alternative SMTP ports:**
   - Port 465 (SSL/TLS) - default
   - Port 587 (STARTTLS) - alternative
   - Update `SMTP_PORT` in `.env` and restart server

4. **Gmail-specific issues:**
   - Use App Password (not regular password)
   - Enable "Less secure app access" (if using regular password)
   - Check Gmail account is not locked
   - Verify 2FA is enabled if using App Password

5. **Test SMTP connection:**

   ```typescript
   // The sendEmail function includes transporter.verify()
   // Check server logs for connection errors
   ```

6. **Check server logs:**
   - Look for "🚨🚨 Send email error 🚨🚨" in console
   - Review error messages for specific issues

#### 2. GitHub OAuth Fails

**Possible causes:**

- Incorrect OAuth credentials
- Callback URL mismatch
- OAuth app not configured

**Solutions:**

- Verify `AUTH_GITHUB_CLIENT_ID` and `AUTH_GITHUB_CLIENT_SECRET`
- Ensure callback URL in GitHub matches: `{BASE_URL}/api/auth/callback/github`
- Check OAuth app is active

#### 3. Session Not Persisting

**Possible causes:**

- Cookie issues
- Database connection problems
- Session expired

**Solutions:**

- Check browser allows cookies
- Verify database is running
- Check `BETTER_AUTH_SECRET` is set
- Clear browser cookies and try again

#### 4. Unauthorized Errors

**Possible causes:**

- Session expired
- Invalid session token
- Middleware not applied

**Solutions:**

- Sign out and sign in again
- Check route is properly protected
- Verify middleware is applied to route

### Debug Mode

Enable Better Auth debug logging in development:

```typescript
// src/lib/auth.ts
logger: {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  disabled: false, // Set to false to enable logging
},
```

### Testing SMTP Connection

Test your SMTP configuration:

```bash
# Using the client.http file
POST http://localhost:3000/api/test-email
Content-Type: application/json

{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "html": "<p>Test</p>"
}
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong `BETTER_AUTH_SECRET` (32+ characters)
   - Rotate secrets regularly

2. **SMTP Credentials**
   - Use app-specific passwords
   - Don't use personal email password
   - Enable 2FA on email account

3. **Session Management**
   - Sessions expire automatically
   - Implement session timeout
   - Clear sessions on sign out

4. **Database**
   - Use connection pooling
   - Enable SSL for production
   - Regular backups

5. **Rate Limiting**
   - Magic link has built-in cooldown
   - Consider adding rate limiting to auth endpoints
   - Monitor for abuse

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [TanStack Router Authentication](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

**Need help?** Check the [main README](./README.md) or open an issue on GitHub.
