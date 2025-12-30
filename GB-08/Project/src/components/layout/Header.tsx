import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Target,
  FileText,
  Mail,
  BookOpen,
  User,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  PlusCircle
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Track Interviews", href: "/track-interviews", icon: Target },
  { name: "Add Interview", href: "/add-interview", icon: PlusCircle },
  { name: "Resume Analysis", href: "/resume-analysis", icon: FileText },
  { name: "Cold Email", href: "/cold-email-generator", icon: Mail },
  { name: "Questions", href: "/questions", icon: BookOpen },
  { name: "Contact", href: "/contact", icon: MessageSquare },
   { name: "Login", href: "/login", icon: null },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
          : "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            I
          </div>
          <span className="text-xl font-bold text-gradient">IntervuIQ</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {getThemeIcon()}
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0"
          >
            {getThemeIcon()}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 p-0"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 text-base font-medium transition-colors hover:text-primary ${
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}