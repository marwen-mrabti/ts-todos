import { LoginForm } from '@/components/login-form';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    const { session, user } = data || {};
    if (session || user) {
      throw redirect({
        to: '/todos',
      });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoginForm />
    </div>
  );
}
