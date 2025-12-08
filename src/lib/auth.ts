import { db } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

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

  // Error handling
  onAPIError: {
    throw: true,
    onError: (error, _ctx) => {
      const err = error as { status?: number; message?: string };
      throw new Error(err.message || 'Internal Server Error');
    },
    errorURL: '/error',
  },

  // Logging
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    disabled: false,
  },

  plugins: [tanstackStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
