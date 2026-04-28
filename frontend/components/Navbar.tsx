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
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
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
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden md:block">
            Invoice<span className="text-blue-500">Zap</span>
          </span>
        </Link>

        {/* Navigation Links */}
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
                    ? "text-white" 
                    : "text-slate-400 hover:text-white"
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
        <div className="flex items-center gap-3 pr-1">
          <div className="hidden lg:flex items-center gap-3 mr-2 border-r border-white/10 pr-4">
             <div className="flex flex-col items-end leading-tight">
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Account Status</p>
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">{userEmail || 'Active User'}</p>
             </div>
             <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-all duration-200"
              title="Logout"
             >
               <LogOut className="w-4 h-4" />
             </button>
          </div>

          <Link 
            href="/invoices/new"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95 hover:shadow-blue-600/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
