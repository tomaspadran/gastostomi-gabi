import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, PlusCircle, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const { setTheme, theme } = useTheme();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary md:mr-4">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            $
                        </div>
                        <span className="hidden md:inline">Gastos App</span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <Link to="/dashboard">
                            <Button
                                variant={isActive('/dashboard') ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("gap-2", isActive('/dashboard') && "bg-secondary font-medium")}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Button>
                        </Link>
                        <Link to="/calendar">
                            <Button
                                variant={isActive('/calendar') ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("gap-2", isActive('/calendar') && "bg-secondary font-medium")}
                            >
                                <Calendar className="h-4 w-4" />
                                <span className="hidden sm:inline">Calendario</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="mr-2"
                        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Cambiar tema</span>
                    </Button>

                    <Link to="/add-expense">
                        <Button size="sm" className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Nuevo Gasto</span>
                        </Button>
                    </Link>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={logout} title="Cerrar Sesión">
                        <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
