import { auth } from '@/lib/auth';
import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, context, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    // if (!session) {
    //   throw redirect({ to: '/login' });
    // }

    console.log(session);

    return next({
      context: {
        user: session?.user,
      },
    });
  }
);
