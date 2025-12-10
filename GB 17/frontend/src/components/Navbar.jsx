import React, { useEffect, useState } from 'react';
import { Menu, X, Code, User, Trophy, Play, LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn,setIsLoggedIn] = useState(false);
  useEffect(()=>{
    const checkLoginStatus = () => {
      const loginStatus =  localStorage.getItem('email') ? true : false;
      setIsLoggedIn(loginStatus);
    };

    checkLoginStatus();

    window.addEventListener('storage', checkLoginStatus);
    // Custom event listener for same-tab sessionStorage changes
    window.addEventListener('sessionStorageChange', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('sessionStorageChange', checkLoginStatus);
    };
  },[isLoggedIn])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const logout = async () => {
    try {
      // Call your logout API endpoint
      localStorage.removeItem('email')
      const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });


      
      if (response.ok) {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter nav links based on login status
  const navLinks = [
    // { href: '/explore', label: 'Explore', icon: LayoutDashboard },
    { href: '/problems', label: 'Problems', icon: Code },
    { href: '/topics', label: 'Topics', icon: BookOpen },
    // { href: '/profile', label: 'Profile', icon: Trophy },
    // Only show Profile if logged in
    ...(isLoggedIn ? [{ href: '/profile', label: 'Profile', icon: User }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white no-underline">
                Code<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Clash</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <NavLink
                  key={href}
                  to={href}
                  className={({ isActive }) =>
                    `group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-cyan-400 bg-slate-800/50'
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              // Show logout button when logged in
              <button
                onClick={logout}
                className="flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-red-400 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-400/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              // Show login/signup when not logged in
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-cyan-400 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyan-400/20">
                  Sign In
                </Link>
                <Link to="/signup" className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-2 pt-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 bg-slate-800/50'
                      : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
            
            {/* Mobile Actions */}
            <div className="pt-4 space-y-2 border-t border-slate-800">
              {isLoggedIn ? (
                // Show logout button when logged in (mobile)
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-center space-x-2 w-full px-4 py-3 text-base font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-red-400 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                // Show login/signup when not logged in (mobile)
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-base font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-cyan-400 rounded-lg transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
