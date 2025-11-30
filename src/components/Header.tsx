import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export default function Header() {
  const { theme } = useTheme();

  return (
    <header className="bg-secondary w-full  text-secondary-foreground sticky top-0 z-100 flex items-center justify-between p-4 shadow-lg">
      <h1 className="ml-4 text-xl font-semibold">
        <Link to="/">
          <img
            src="/tanstack-word-logo-white.svg"
            alt="TanStack Logo"
            className={cn("h-10", {
              "invert": theme === "light"
            })}
          />
        </Link>
      </h1>
      <nav className="flex items-center justify-between gap-2">
        <Link to="/todos">todos</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
