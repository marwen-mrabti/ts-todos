import { getTodosCountTool, showTodosTool } from '@/lib/ai-tools-definition';
import { authMiddleware } from '@/middleware/auth-middleware';
import { chat, toStreamResponse } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/chat/')({
  server: {
    middleware: [authMiddleware],
    handlers: ({ createHandlers }) =>
      createHandlers({
        POST: {
          middleware: [],
          handler: async ({ request, context }) => {
            const { messages, conversationId } = await request.json();

            try {
              // Create a streaming chat response
              const adapter = gemini();
              const stream = chat({
                adapter,
                model: 'gemini-2.5-flash',
                messages,
                conversationId,
                tools: [getTodosCountTool, showTodosTool],
              });

              console.info('\n🚩🚩 chat messages 🚩🚩\n', messages);

              // Convert stream to HTTP response
              return toStreamResponse(stream);
            } catch (error) {
              console.error('\n🚩🚩 chat error 🚩🚩\n', error);
              return new Response(
                JSON.stringify({
                  error:
                    error instanceof Error
                      ? error.message
                      : 'An error occurred',
                }),
                {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            }
          },
        },
      }),
  },
});
