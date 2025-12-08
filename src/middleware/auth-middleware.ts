// middleware/auth-middleware.ts
import { auth } from '@/lib/auth';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

// For route protection
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.session || !session.user) {
      throw redirect({
        to: '/login',
      });
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    });
  }
);

// For server functions
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
