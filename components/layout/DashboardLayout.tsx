
import React, { useState, ReactNode } from 'react';
import Sidebar, { SidebarItem } from './Sidebar';
import Header from './Header';

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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarItems,
  activeTab,
  onTabChange,
  user,
  onLogout,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFB]">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        user={user}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header
          user={user}
          activeTab={activeTab}
          onNotificationClick={() => onTabChange('notifications')}
        />

        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFB]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
