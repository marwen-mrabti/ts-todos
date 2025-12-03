import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  ({ next, context }) => {
    // Check auth, add user to context
    // const user = await getUser();
    const user = { id: '123', name: 'John Doe' }; // Mock user
    if (!user) {
      throw redirect({ to: '/' });
    }

    return next({
      context: { user },
    });
  }
);
