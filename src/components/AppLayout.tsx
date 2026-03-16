import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Receipt, BarChart3, Menu, Users, KeyRound, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/apartments', label: 'Apartments', icon: Building2 },
  { path: '/billing', label: 'Billing', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

const ADMIN_ITEMS = [
  { path: '/users', label: 'User Management', icon: Users },
];

const ACCOUNT_ITEMS = [
  { path: '/change-password', label: 'Change Password', icon: KeyRound },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  const allNavItems = [
    ...NAV_ITEMS,
    ...(isAdmin ? ADMIN_ITEMS : []),
    ...ACCOUNT_ITEMS,
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <span className="font-display text-2xl italic text-primary">AS</span>
          <div>
            <h2 className="font-display text-sm font-semibold text-sidebar-foreground">AS Apartment</h2>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Management</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">Admin</p>
              </div>
              {ADMIN_ITEMS.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}

          <div className="pt-4 pb-1 px-3">
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">Account</p>
          </div>
          {ACCOUNT_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          <button onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive/80 hover:bg-destructive/10 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-sidebar-foreground/60 truncate">{user?.email}</p>
          <p className="text-[10px] text-sidebar-foreground/40">
            © {new Date().getFullYear()} Powered by Zurya Tech
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-4 lg:px-8 py-4 bg-card border-b border-border">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground">
            {allNavItems.find(n => n.path === location.pathname)?.label || 'AS Apartment'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

        <footer className="px-4 lg:px-8 py-3 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} AS Residential Group · Powered by Zurya Tech
          </p>
        </footer>
      </div>
    </div>
  );
}
