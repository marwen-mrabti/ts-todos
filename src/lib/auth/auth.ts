import { env } from '@/lib/env';
import { db } from '@/server/db';
import { sendEmailWithMagicLink } from '@/server/emails/send-magicLink';
import { sendWelcomeEmail } from '@/server/emails/send-welcome-email';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { createAuthMiddleware, magicLink } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

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

  rateLimit: {
    enabled: true,
    storage: 'database', // by default it is stored in memory
    modelName: 'rateLimit', // name of the table in the database
    window: 60, // time window in seconds => //! in 60s a user can make 100 requests
    max: 100, // max requests in the window => //! request 101 gets blocked
    customRules: {
      '/get-session': false,
      '/sign-in/social/*': async (request) => {
        console.log('🎄🎄🎄********rate limit**********🎄🎄🎄', request);
        return {
          window: 60,
          max: 10,
        };
      },
      '/sign-in/magicLink': {
        window: 60,
        max: 10,
      },
      '/two-factor/*': {
        window: 60,
        max: 5,
      },
    },
  },

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
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          void sendWelcomeEmail({
            email: newSession.user.email,
            name: newSession.user.name,
          });
        }
      } else if (ctx.path === '/get-session') {
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

export type Session = typeof auth.$Infer.Session;
