import { db } from '@/db';
import { sendEmailWithMagicLink } from '@/lib/emails/send-magicLink';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, magicLink } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

// Custom error class for API errors
class AuthError extends Error {
  statusCode: number;
  statusMessage: string;

  constructor(statusCode: number, statusMessage: string) {
    super(statusMessage);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

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

  advanced: {
    cookiePrefix: 'ts-auth',
  },

  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      const err = error as { status?: number; message?: string };
      throw new AuthError(
        err.status || 500,
        err.message || 'Internal Server Error'
      );
    },
    errorURL: '/error',
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/get-session') {
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
      sendMagicLink: async ({ email, token, url }, ctx) => {
        await sendEmailWithMagicLink({ data: { email, url } });
      },
    }),

    tanstackStartCookies(),
  ],

  // Logging
  logger: {
    disabled: false,
    disableColors: false,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    log: (level, message, ...args) => {
      console.log(`[${level}] ${message}`, ...args);
    },
  },
});

export type Session = typeof auth.$Infer.Session;
