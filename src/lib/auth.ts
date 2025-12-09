import { db } from '@/db';
import { sendEmailWithMagicLink } from '@/lib/emails/send-magicLink';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, magicLink } from 'better-auth/plugins';
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
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    disabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;
