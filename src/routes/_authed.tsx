import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const user = context.user;
    if (!user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    // Pass user to child routes
    return { user };
  },
});
