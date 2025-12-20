import { LoginForm } from '@/components/auth/login-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <LoginForm />
    </div>
  );
}
