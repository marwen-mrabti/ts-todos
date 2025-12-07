import { auth } from '@/lib/auth';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

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
        session: session?.session,
        user: session?.user,
      },
    });
  }
);
