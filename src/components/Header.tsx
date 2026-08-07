
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatedLogo } from "./AnimatedLogo";
import { User, LogOut, Settings, Menu, X, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, userRole, signOut, loading } = useAuth();
  const { unreadCount } = useNotificationHistory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center">
          <AnimatedLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/notifications"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          
          {loading ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : user ? (

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 smooth-transition hover:scale-105 rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-warm flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {userRole && (
                    <span className="capitalize font-medium hidden sm:inline">{userRole}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/profile" className="w-full flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/settings/notifications" className="w-full flex items-center gap-2">
                    <Bell className="h-4 w-4" aria-hidden="true" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="rounded-lg text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button 
                size="sm" 
                className="btn-premium bg-gradient-warm text-white border-0 rounded-xl gap-2 shadow-warm hover:shadow-warm-lg"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Get Started</span>
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden rounded-xl min-h-11 min-w-11"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="container py-4 flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="px-4 py-3 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
