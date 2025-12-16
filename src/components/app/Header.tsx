import { useTheme } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from '@tanstack/react-router';
import { BotMessageSquare, LogOutIcon, Package, User } from 'lucide-react';

export default function Header() {
  const { themeMode } = useTheme();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session ? session.user : null;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          return navigate({ to: '/login' });
        },
      },
    });
  };

  return (
    <header className="bg-secondary/70 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack Logo"
              className={cn('h-8', {
                invert: themeMode === 'light',
              })}
            />
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {session?.user && (
            <Button
              variant="ghost"
              size="sm"
              render={<Link to="/todos" preloadDelay={500} />}
              nativeButton={false}
            >
              Todos
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <Button
              variant="ghost"
              render={<Link to="/login" />}
              nativeButton={false}
            >
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                  />
                }
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session?.user.image || undefined}
                    alt={session?.user.name || 'User'}
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" >
                <DropdownMenuGroup className={cn('cursor-pointer')}>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup >
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/products"
                        search={{
                          page: 1,
                          searchQuery: '',
                          category: 'all',
                        }}
                      />
                    }
                    className={cn('cursor-pointer')}
                  >
                    <Package className="h-4 w-4" data-icon="inline-start" />
                    Products
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup  >
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/chat"
                      />
                    }
                    className={cn('cursor-pointer')}
                  >
                    <BotMessageSquare className="h-4 w-4" data-icon="inline-start" />
                    Chat
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="hover:cursor-pointer">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOutIcon className='size-4 ' data-icon="inline-start" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
