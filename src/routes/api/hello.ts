import { createFileRoute } from '@tanstack/react-router';

import { authMiddleware } from '@/middleware/auth-middleware';

export const Route = createFileRoute('/api/hello')({
  server: {
    middleware: [authMiddleware], // Applies to all handlers
    handlers: {
      GET: async () => {
        // middleware: [], // Runs after authMiddleware, only for GET
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return new Response('Hello, World!');
      },

      POST: async ({ request, context }) => {
        console.log('User from context:', context.user); // Example usage of user from authMiddleware
        const body = await request.json();
        return new Response(
          JSON.stringify({ message: `Hello, ${body.name}!` })
        );
      },
    },
  },
});
