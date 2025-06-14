import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { User, Home, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, userRole, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 smooth-transition hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-r from-warm-orange-400 to-warm-orange-600 rounded-full flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="font-poppins font-bold text-xl bg-gradient-to-r from-warm-orange-500 to-pastel-green-500 bg-clip-text text-transparent">
              Mummy Meals
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary smooth-transition">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary smooth-transition">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary smooth-transition">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {loading ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 smooth-transition">
                  <User className="h-4 w-4" />
                  {userRole && (
                    <span className="capitalize">{userRole}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2 smooth-transition">
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
