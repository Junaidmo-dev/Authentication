'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { path: '/', icon: 'grid_view', label: 'Dashboard' },
    { path: '/todos', icon: 'task_alt', label: 'Tasks' },
    { path: '/notes', icon: 'notes', label: 'Notes' },
    { path: '/entities', icon: 'account_tree', label: 'Entities' },
    { path: '/profile', icon: 'settings', label: 'Preferences' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Precision Engineered */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <Link href="/" className="h-20 flex items-center px-8 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-zinc-100 dark:text-zinc-900 text-[20px]">terminal</span>
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform duration-300">Secure</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Operations</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? '' : 'opacity-40 group-hover:opacity-100 transition-opacity'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 font-black text-[10px] flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate tracking-tight">{user?.name}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter truncate">{user?.role || 'Operator'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                title="Terminate Session"
              >
                <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Sharp Minimal */}
        <header className="h-16 flex items-center justify-between px-6 md:px-10 z-30 sticky top-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-zinc-500 hover:text-zinc-900">
              <span className="material-symbols-outlined">menu_open</span>
            </button>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block mx-2" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hidden md:block">
              {navItems.find(i => isActive(i.path))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Simple Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">System Live</span>
            </div>

            <button className="relative p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};