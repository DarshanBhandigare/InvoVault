"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Zap,
  PlusCircle,
  LogOut,
  User,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from "@/components/theme-provider";


const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className={cn(
          "backdrop-blur-xl rounded-full px-4 py-2 flex items-center justify-between transition-colors duration-300",
          "dark:bg-slate-950/60 dark:border-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/5",
          "bg-white/70 border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
        )}>
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight dark:text-white text-slate-900">
              Invoice<span className="text-blue-500">Zap</span>
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "dark:text-white text-slate-900" 
                      : "dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                  )}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-500/50 rounded-full transition-all duration-300 group-hover:w-4" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 pr-1">
            <div className="hidden lg:flex items-center gap-3 mr-2 border-r dark:border-white/10 border-slate-200 pr-4">
              <div className="flex flex-col items-end leading-tight">
                  <p className="text-[9px] dark:text-slate-500 text-slate-400 uppercase tracking-[0.2em] font-bold">Account Status</p>
                  <p className="text-xs font-semibold dark:text-slate-200 text-slate-700 truncate max-w-[150px]">{userEmail || 'Active User'}</p>
              </div>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/10 hover:bg-slate-200/60 rounded-full transition-all duration-200"
                title="Toggle Theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              </button>

              <button 
                onClick={handleLogout}
                className="p-2 dark:text-slate-400 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Tablet/Small Desktop Toggle */}
            <div className="hidden md:flex lg:hidden items-center gap-2 mr-2 border-r dark:border-white/10 border-slate-200 pr-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/10 hover:bg-slate-200/60 rounded-full transition-all"
                title="Toggle Theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 dark:text-white text-slate-700 dark:bg-white/10 bg-slate-200/60 rounded-full dark:hover:bg-white/20 hover:bg-slate-300/60 transition-all"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Logout (Hidden on mobile as it's in the menu) */}
            <div className="hidden md:flex lg:hidden">
              <button 
                onClick={handleLogout}
                className="p-2 dark:text-slate-400 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden dark:bg-slate-950/90 bg-white/95 backdrop-blur-2xl pt-28 px-6"
          >
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-[0.3em] mb-2 px-4">Menu</p>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-3xl text-lg font-bold transition-all",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-100 dark:hover:text-white hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", isActive ? "text-white" : "dark:text-slate-500 text-slate-400")} />
                    {item.name}
                  </Link>
                );
              })}

              <div className="mt-8 pt-8 border-t dark:border-white/10 border-slate-200">
                <div className="flex items-center gap-4 px-6 mb-6">
                  <div className="w-10 h-10 rounded-full dark:bg-slate-800 bg-slate-100 flex items-center justify-center dark:border-white/10 border border-slate-200">
                    <User className="w-5 h-5 dark:text-slate-400 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white text-slate-900">{userEmail || 'Active User'}</p>
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 uppercase font-bold tracking-widest">Pro Account</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-6 py-4 text-rose-500 font-bold hover:bg-rose-500/10 rounded-3xl transition-all"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
