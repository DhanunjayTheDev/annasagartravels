import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, User, LogOut, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '../ui/Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Annasagar Travels</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/vehicles?vehicleType=car" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cars
            </Link>
            <Link to="/vehicles?vehicleType=bus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Buses
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/my-bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  My Bookings
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    <User className="h-4 w-4 inline mr-1" />
                    {user?.name}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link to="/vehicles?vehicleType=car" className="px-3 py-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                Cars
              </Link>
              <Link to="/vehicles?vehicleType=bus" className="px-3 py-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                Buses
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/my-bookings" className="px-3 py-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                    My Bookings
                  </Link>
                  <button className="px-3 py-2 rounded-md hover:bg-accent text-left text-destructive" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
