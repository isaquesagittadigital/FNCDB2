
import React, { useState, ReactNode, useEffect, useRef } from 'react';
import Sidebar, { SidebarItem } from './Sidebar';
import Header from './Header';
import { LogoFull } from '../shared/ui/Logo';
import { Bell, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export type { SidebarItem };

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
  children: ReactNode;
  sidebarTheme?: 'light' | 'dark';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarItems,
  activeTab,
  onTabChange,
  user,
  onLogout,
  children,
  sidebarTheme = 'dark'
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Check for unread notifications (for mobile header bell)
  useEffect(() => {
    const checkUnread = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { count } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('is_read', false);
      setHasUnread(count !== null && count > 0);
    };
    checkUnread();
  }, [activeTab]);

  // Close mobile menu on tab change
  const handleMobileTabChange = (tabId: string) => {
    setIsMobileMenuOpen(false);
    onTabChange(tabId);
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFB]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          user={user}
          onLogout={onLogout}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={sidebarTheme}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Slide-in sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 md:hidden animate-slide-in-left">
            <Sidebar
              items={sidebarItems}
              activeTab={activeTab}
              onTabChange={handleMobileTabChange}
              user={user}
              onLogout={onLogout}
              isOpen={true}
              onToggle={() => setIsMobileMenuOpen(false)}
              theme={sidebarTheme}
              isMobile={true}
              onMobileClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile top header — visible only on mobile */}
        <header className="md:hidden bg-[#002B49] px-4 h-16 flex items-center justify-between z-30">
          <LogoFull dark={false} className="h-7" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange('notifications')}
              className="relative text-white/80 hover:text-white transition-colors"
            >
              <Bell size={22} />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#002B49]"></span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Desktop header — hidden on mobile */}
        <div className="hidden md:block">
          <Header
            user={user}
            activeTab={activeTab}
            onNotificationClick={() => onTabChange('notifications')}
            onLogout={onLogout}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-[#F8FAFB]">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
