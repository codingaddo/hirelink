import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
}

export function Layout({ children, isAdmin: _isAdmin = false }: LayoutProps) {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  const isUnprotectedRoute = !location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-primary p-1.5 text-primary-foreground shadow-lg shadow-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              HireLink
            </span>
          </Link>

          <nav className="flex items-center space-x-2 md:space-x-4">
            {currentUser ? (
              <>
                {isUnprotectedRoute && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md hover:bg-muted text-muted-foreground"
                  >
                    <span className="hidden md:inline">Dashboard</span>
                    <LayoutDashboard className="h-4 w-4 md:hidden" />
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 flex items-center gap-2 pl-2 pr-1 rounded-full hover:bg-muted focus-visible:ring-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline text-sm font-medium">
                        {currentUser.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/profile"
                        className="cursor-pointer flex w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <Link to="/login">Recruiter Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for The Digicoast Assessment. © 2026 HireLink.
          </p>
        </div>
      </footer>
    </div>
  );
}
