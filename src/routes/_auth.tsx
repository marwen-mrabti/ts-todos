import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context, location }) => {
    const { user } = context;
    if (user) {
      throw redirect({
        to: '/todos',
        search: { redirect: location.href },
      });
    }
  },
})


