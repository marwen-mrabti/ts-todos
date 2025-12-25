import {
  addTodoTool,
  getTodosCountTool,
  getTodosTool,
} from '@/lib/ai-chat-tools/todo-tools';
import { authMiddleware } from '@/middleware/auth-middleware';
import { chat, maxIterations, toServerSentEventsStream } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { createFileRoute } from '@tanstack/react-router';

const SYSTEM_PROMPT = `
You are a helpful assistant that can help the user manage their todos.

Tools:
1- getTodosCount: Get the number of todos
2- showTodos: List the user todos
3- addTodo: Add a new todo

Example workflow:
User: "How many todos do I have?"
Step 1: Call getTodosCount()
Step 2: Done - do NOT add any text after calling getTodosCount
`;

export const Route = createFileRoute('/api/chat/')({
  server: {
    middleware: [authMiddleware],
    handlers: ({ createHandlers }) =>
      createHandlers({
        POST: {
          middleware: [],
          handler: async ({ request }) => {
            const requestSignal = request.signal;

            // If request is already aborted, return early
            if (requestSignal.aborted) {
              return new Response(null, { status: 499 }); // 499 = Client Closed Request
            }
            const abortController = new AbortController();
            const body = await request.json();
            const { messages, data } = body;
            const conversationId: string | undefined = data?.conversationId;

            try {
              // Create a streaming chat response
              const stream = chat({
                adapter: geminiText('gemini-2.5-flash'),
                agentLoopStrategy: maxIterations(5),
                conversationId,
                messages,
                systemPrompts: [SYSTEM_PROMPT],
                tools: [getTodosCountTool, getTodosTool, addTodoTool],
              });

              const readableStream = toServerSentEventsStream(
                stream,
                abortController
              );

              // Convert stream to HTTP response
              return new Response(readableStream, {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  Connection: 'keep-alive',
                },
              });
            } catch (error: unknown) {
              console.error('\n🚩🚩 chat error 🚩🚩\n', error);
              if (
                (error instanceof Error && error.name === 'AbortError') ||
                abortController.signal.aborted
              ) {
                return new Response(null, { status: 499 }); // 499 = Client Closed Request
              }
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
