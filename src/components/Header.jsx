import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/#servicios' },
    { name: 'Sobre Mí', path: '/#sobre-mi' },
    { name: 'Precios', path: '/#precios' },
    { name: 'Contacto', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-md py-2' : 'shadow-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img
              src="https://horizons-cdn.hostinger.com/bbea93ca-5857-44cc-b442-c78491fc8a6f/4a4d80a2439fdbe609e0be3e73e0a3ce.png"
              alt="Tu Nutri Sofi logo"
              className="h-12 md:h-16 w-auto transition-all duration-300"
            />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                Tu Nutri <span className="text-primary">Sofi</span>
              </span>
              <span className="text-xs text-gray-500 hidden lg:block italic mt-0.5">
                Tu bienestar comienza cuando haces de la comida tu aliada 🍎
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-base font-medium text-gray-700 transition-colors hover:text-primary"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-base font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path ? 'text-primary font-bold' : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}

            {isAdmin && (
              <Link to="/admin" className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Settings className="h-4 w-4" /> Panel Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* BOTÓN OCULTO PARA ADMIN */}
                {!isAdmin && (
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                    <Link to="/booking">Agendar Cita</Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">{currentUser?.nombre?.split(' ')[0] || 'Perfil'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-base font-medium text-gray-700 hover:text-primary transition-colors">
                  Iniciar Sesión
                </Link>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                  <Link to="/booking">Agendar Cita</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-primary rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 mt-4 space-y-4 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 text-base font-bold text-blue-600 hover:text-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Panel Admin
                </div>
              </Link>
            )}
            
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Mi Perfil ({currentUser?.nombre?.split(' ')[0]})
                  </Link>

                  {/* BOTÓN MÓVIL OCULTO PARA ADMIN */}
                  {!isAdmin && (
                    <Link
                      to="/booking"
                      className="block w-full py-3 text-center bg-primary text-white rounded-xl font-medium shadow-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Agendar Cita
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 text-base font-medium text-red-500 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-base font-medium text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/booking"
                    className="block w-full py-3 text-center bg-primary text-white rounded-xl font-medium shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Agendar Cita
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;