import type { TODO } from '@/db/schema/todos';
import { Link } from '@tanstack/react-router';


export default function TodoList({ todos }: { todos: TODO[] }) {


  return (<ul className="mt-4 space-y-2">
    {todos.map((todo) => (
      <li key={todo.id} className="bg-accent/50 rounded p-2">
        <Link
          to="/todos/$todoId"
          params={{ todoId: todo.id }}
          className="hover:underline"
          activeProps={{ className: 'font-bold underline' }}
        >
          {todo.title}
        </Link>
      </li>
    ))}
  </ul>
  );
}
