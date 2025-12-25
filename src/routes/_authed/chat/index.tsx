import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIErrorDisplay } from '@/hooks/useAIErrorDisplay';
import { saveToLocalStorage } from '@/lib/ai-chat-tools/todo-tools';
import { cn } from '@/lib/utils';
import { clientTools } from '@tanstack/ai-client';
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { AlertCircle } from 'lucide-react';

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading, error } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: clientTools(saveToLocalStorage), // clientTools(t1, t2, ...)
  });

  const errorDisplay = useAIErrorDisplay(error, {
    simplifyQuotaErrors: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className='flex flex-col h-full w-full max-w-3xl mx-auto bg-background'>
      {error && (
        <div className='p-4 pb-0'>
          <Alert variant='destructive' className='relative'>
            <AlertCircle className='h-4 w-4 animate-pulse duration-[3000]' />
            <AlertTitle className='flex items-center justify-between uppercase font-bold'>
              {errorDisplay?.code}
            </AlertTitle>
            <AlertDescription className='text-sm font-medium mt-1 text-muted-foreground!'>
              {errorDisplay?.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.role !== 'user' && (
                <div
                  className={cn('text-xs mb-1', {
                    'opacity-80': !isLoading,
                    'animate-pulse opacity-100': isLoading,
                  })}
                >
                  {message.role === 'assistant' ? 'Assistant' : 'System'}
                </div>
              )}
              <div className='text-sm leading-relaxed'>
                {message.parts.map((part, idx) => {
                  if (part.type === 'thinking') {
                    return (
                      <div
                        key={idx}
                        className='text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-2 mb-2'
                      >
                        💭 Thinking: {part.content}
                      </div>
                    );
                  }
                  if (part.type === 'text') {
                    return (
                      <div key={idx} className='whitespace-pre-wrap'>
                        {part.content}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='p-4 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <form
          onSubmit={handleSubmit}
          className='flex items-center gap-2 relative'
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message...'
            className='flex-1 min-h-11'
            disabled={isLoading}
          />
          <Button
            type='submit'
            variant='default'
            disabled={!input.trim() || isLoading}
            className='min-w-20 h-11'
          >
            {isLoading ? '...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
