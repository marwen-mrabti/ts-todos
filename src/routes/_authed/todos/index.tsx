import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/todos/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8 text-center">
      <h2>Select a todo from the list</h2>
      <p>Click on any todo to view details</p>
    </div>
  );
}
