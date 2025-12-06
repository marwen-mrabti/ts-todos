import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export default function Header() {
  const { themeMode } = useTheme();

  return (
    <header className="bg-secondary text-secondary-foreground sticky top-0 z-10 flex w-full items-center justify-between p-4 shadow-lg">
      <h1 className="ml-4 text-xl font-semibold">
        <Link to="/">
          <img
            src="/tanstack-word-logo-white.svg"
            alt="TanStack Logo"
            className={cn('h-10', {
              invert: themeMode === 'light',
            })}
          />
        </Link>
      </h1>

      <nav className="flex items-center justify-between gap-4">

        <Link to="/products" search={{
          page: 1,
          searchQuery: "",
          category: "all"
        }}
          className="font-bold text-muted-foreground"
          activeProps={{
            className: 'underline text-primary',
          }}
        >
          products
        </Link>

        <Link
          to="/todos"
          className="font-bold text-muted-foreground"
          activeProps={{
            className: 'underline text-primary',
          }}
        // preload="viewport"
        >
          todos
        </Link>

        <ThemeToggle />
      </nav>
    </header>
  );
}
