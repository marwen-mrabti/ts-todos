import { auth } from '@/lib/auth';
import { validateWithPretty } from '@/lib/helpers';
import { magicLinkLoginSchema } from '@/lib/utils';
import { createServerFn } from '@tanstack/react-start';

import { getRequestHeaders } from '@tanstack/react-start/server';

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers,
    });
    return session?.user;
  }
);

export const signInWithMagicLink = createServerFn({ method: 'POST' })
  .inputValidator((data) => validateWithPretty(magicLinkLoginSchema, data))
  .handler(async ({ data }) => {
    try {
      const headers = getRequestHeaders();
      const response = await auth.api.signInMagicLink({
        body: {
          email: data.email,
          name: data.name,
          callbackURL: '/todos',
          newUserCallbackURL: '/onboarding',
          errorCallbackURL: '/error',
        },
        headers,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send magic link email. Please try again later.',
      };
    }
  });
