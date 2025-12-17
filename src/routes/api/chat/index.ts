import { getTodosCountTool, showTodosTool } from '@/lib/ai-tools-definition';
import { authMiddleware } from '@/middleware/auth-middleware';
import { chat, toStreamResponse } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';
import { openai } from '@tanstack/ai-openai';
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
              const geminiAdapter = gemini();
              const openaiAdapter = openai();
              const stream = chat({
                adapter: openaiAdapter,
                model: 'gpt-3.5-turbo',
                messages,
                conversationId,
                tools: [getTodosCountTool, showTodosTool],
              });

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
