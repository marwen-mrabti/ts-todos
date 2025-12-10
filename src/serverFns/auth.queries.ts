import { auth } from '@/lib/auth';
import { validateWithPretty } from '@/lib/helpers';
import { magicLinkLoginSchema } from '@/lib/utils';
import { createServerFn } from '@tanstack/react-start';

import {
  deleteCookie,
  getCookie,
  getRequestHeaders,
  setCookie,
} from '@tanstack/react-start/server';

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers,
    });
    return session?.user;
  }
);

export const MAGIC_LINK_DATA_KEY = 'magic-link-data';

export const signInWithMagicLink = createServerFn({ method: 'POST' })
  .inputValidator((data) => validateWithPretty(magicLinkLoginSchema, data))
  .handler(async ({ data }) => {
    try {
      const headers = getRequestHeaders();
      // will be used in error page to send new magic link
      setCookie(
        MAGIC_LINK_DATA_KEY,
        JSON.stringify({
          email: data.email,
          name: data.name,
        }),
        {
          httpOnly: true,
          maxAge: 60 * 15,
          path: '/',
        }
      );
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

export const getMagicLinkData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cookie = getCookie(MAGIC_LINK_DATA_KEY);
    return cookie;
  }
);

export const deleteMagicLinkData = createServerFn({ method: 'POST' }).handler(
  async () => {
    deleteCookie(MAGIC_LINK_DATA_KEY);
  }
);
