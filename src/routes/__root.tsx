import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import Header from '../components/app/Header';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '@/assets/styles.css?url';
import ErrorComponent from '@/components/app/error-component';

import NotFound from '@/components/app/not-found-component';
import { ThemeProvider } from '@/components/app/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { COOLDOWN_KEY, MAGICLINK_EMAIL_KEY, MAGICLINK_NAME_KEY } from '@/hooks/useMagicLink';
import { removeDataFromLocalStorage } from '@/lib/helpers';
import { getCurrentUser } from '@/serverFns/auth.queries';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack-todos',
      },
      {
        description: 'A simple todos app built with TanStack Router',
      },
      {
        keywords: 'todos, tanstack-start, drizzle, postgresql',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (user) {
      removeDataFromLocalStorage([COOLDOWN_KEY, MAGICLINK_EMAIL_KEY, MAGICLINK_NAME_KEY]);
    }
    return {
      user,
    };
  },

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }) => (
    <ErrorComponent error={error} reset={reset} />
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground relative grid min-h-dvh max-w-screen grid-rows-[auto_1fr] overflow-x-hidden">
        <ThemeProvider>
          <Header />
          <main className="h-full w-full">{children}</main>
          <Toaster position="top-right" />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
