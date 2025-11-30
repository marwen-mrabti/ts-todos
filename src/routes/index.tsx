import { useMutation } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { createTodo } from '@/db/queries/todos';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const [title, setTitle] = useState('');
  const context = useRouteContext({ from: '/' });
  const navigate = useNavigate({ from: '/' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const mutation = useMutation({
    mutationFn: async (todo: string) => {
      await createTodo({ data: { title: todo } });
    },
    onError: (error) => {
      toast('Failed to add the todo', {
        description: (
          <pre className="bg-destructive text-destructive-foreground mt-2 w-xs overflow-x-auto rounded-md p-4 text-pretty">
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
    onSuccess: () => {
      setTitle('');
      return navigate({ to: '/todos' });
    },
    onSettled: () => {
      context.queryClient.invalidateQueries({
        queryKey: ['todos'],
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync(title);
    return;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 bg-card">
      <h2 className="text-primary text-2xl uppercase">Add todo</h2>
      <div>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={title}
            onChange={handleChange}
            placeholder="New Todo Title"
            className="mr-2 rounded-md border p-2"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Adding...' : 'Add Todo'}
          </button>
        </form>
      </div>
    </div>
  );
}
