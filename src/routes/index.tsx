import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/auth-client';
import { createTodo } from '@/serverFns/todos.actions';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [title, setTitle] = useState('');
  const context = useRouteContext({ from: '/' });
  const navigate = useNavigate({ from: '/' });

  const { data: session } = authClient.useSession();
  const user = session ? session.user : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const mutation = useMutation({
    mutationFn: async (todo: string) => {
      await createTodo({ data: { title: todo } });
    },
    onSuccess: () => {
      setTitle('');
      return navigate({ to: '/todos' });
    },

    onError: (error) => {
      toast('Failed to add the todo', {
        description: (
          <pre className="bg-destructive text-destructive-foreground mt-2 w-xs overflow-x-auto rounded-md p-4 text-balance">
            {error.message}
          </pre>
        ),
        position: 'top-right',
        classNames: {
          content: 'w-sm flex flex-col gap-2',
        },
        style: {
          '--border-radius': 'calc(var(--radius)  + 4px)',
        } as React.CSSProperties,
      });
    },

    onSettled: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['todos'],
      });
    },
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add a todo');
      return navigate({ to: '/login' })
    }
    await mutation.mutateAsync(title);
    return;
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-primary text-2xl uppercase">Add todo</h2>
      <div>
        <form onSubmit={handleAddTodo} className="mt-4">
          <input
            type="text"
            value={title}
            onChange={handleChange}
            placeholder="New Todo Title"
            className="mr-2 rounded-md border p-2"
          />
          <Button
            type="submit"
            variant="default"
            className="ml-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutation.isPending || !title.trim()}
          >
            {mutation.isPending ? 'Adding...' : 'Add Todo'}
          </Button>
        </form>
      </div>
    </div>
  );
}
