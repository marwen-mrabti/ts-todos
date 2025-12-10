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

# Database
DATABASE_URL=postgresql://postgres:db_password@localhost:5432/ts_todos

# Auth
BETTER_AUTH_SECRET="your-secret-key-here"
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email SMTP (for magic link)
SMTP_SERVICE="gmail"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Better Auth Setup

The auth configuration is located in [`src/lib/auth.ts`](./src/lib/auth.ts):

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BASE_URL,

  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 30, // 30 minutes
      sendMagicLink: async ({ email, token, url }, ctx) => {
        await sendEmailWithMagicLink({ data: { email, url } });
      },
    }),
    tanstackStartCookies(),
  ],
});
```

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

**Configuration** ([`src/lib/emails/send-email.ts`](./src/lib/emails/send-email.ts)):

```typescript
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '465');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};
```

**Magic Link Email Template** ([`src/lib/emails/send-magicLink.ts`](./src/lib/emails/send-magicLink.ts)):

The email includes:

- Professional HTML template
- Clear call-to-action button
- Plain text fallback
- Security notice (30-minute expiration)

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

**Solutions:**

- Verify SMTP environment variables
- Check spam/junk folder
- Try port 587 instead of 465
- Use Gmail App Password (not regular password)

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
