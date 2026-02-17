
import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronDown,
    LogOut,
    User
} from 'lucide-react';
import { LogoIcon, LogoFull } from '../shared/ui/Logo';
import { usePermissions } from '../shared/contexts/PermissionsContext';

export interface SidebarItem {
    id: string;
    label: string;
    icon: any;
    subItems?: SidebarItem[];
    permissionModule?: string;
}

interface SidebarProps {
    items: SidebarItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    };
    onLogout: () => void;
    isOpen: boolean;
    onToggle: () => void;
    theme?: 'light' | 'dark';
}

const NavItem: React.FC<{
    item: SidebarItem,
    isSub?: boolean,
    activeTab: string,
    isOpen: boolean,
    onTabChange: (id: string) => void,
    theme: 'light' | 'dark'
}> = ({ item, isSub = false, activeTab, isOpen, onTabChange, theme }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    const baseClasses = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all";
    const activeClasses = theme === 'light'
        ? 'bg-[#E6F6F7] text-[#00A3B1] font-bold shadow-sm'
        : 'bg-[#003B63] text-[#00A3B1] font-bold shadow-md shadow-black/20';

    const inactiveClasses = theme === 'light'
        ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
        : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium';

    const iconColor = isActive
        ? 'text-[#00A3B1]'
        : (theme === 'light' ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-white');

    return (
        <button
            onClick={() => onTabChange(item.id)}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isSub ? 'pl-10 text-xs' : ''}`}
        >
            <Icon size={isSub ? 16 : 20} className={iconColor} />
            {isOpen && <span className="truncate">{item.label}</span>}
        </button>
    );
};

const NavGroup: React.FC<{
    item: SidebarItem,
    activeTab: string,
    isOpen: boolean,
    onTabChange: (id: string) => void,
    expandedMenus: Record<string, boolean>,
    toggleMenu: (id: string) => void,
    theme: 'light' | 'dark'
}> = ({ item, activeTab, isOpen, onTabChange, expandedMenus, toggleMenu, theme }) => {
    const Icon = item.icon;

    const isParentActive = (item: SidebarItem) => {
        if (!item.subItems) return false;
        return item.subItems.some(sub => sub.id === activeTab);
    };

    const hasActiveChild = isParentActive(item);

    const baseGroupClasses = "w-full flex items-center justify-between px-3 py-2.5 font-medium rounded-xl group transition-all";

    // For parent item, if light theme:
    // Active child logic: Maybe bold text or subtle bg?
    // In dark theme it was 'text-white bg-white/10'
    const activeGroupClasses = theme === 'light'
        ? 'text-[#00A3B1] bg-[#E6F6F7]'
        : 'text-white bg-white/10';

    const inactiveGroupClasses = theme === 'light'
        ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        : 'text-slate-300 hover:bg-white/5 hover:text-white';

    const iconColor = hasActiveChild
        ? 'text-[#00A3B1]'
        : (theme === 'light' ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-white');

    return (
        <div className="space-y-1">
            <button
                onClick={() => toggleMenu(item.id)}
                className={`${baseGroupClasses} ${hasActiveChild ? activeGroupClasses : inactiveGroupClasses}`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={iconColor} />
                    {isOpen && <span>{item.label}</span>}
                </div>
                {isOpen && (
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${expandedMenus[item.id] ? '' : '-rotate-90'}`}
                    />
                )}
            </button>
            {expandedMenus[item.id] && isOpen && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {item.subItems?.map(sub => (
                        <NavItem
                            key={sub.id}
                            item={sub}
                            isSub
                            activeTab={activeTab}
                            isOpen={isOpen}
                            onTabChange={onTabChange}
                            theme={theme}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    items,
    activeTab,
    onTabChange,
    user,
    onLogout,
    isOpen,
    onToggle,
    theme = 'dark' // Default to dark for backward compatibility
}) => {
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const { hasPermission } = usePermissions();

    const canShow = (item: SidebarItem) => {
        if (!item.permissionModule) return true;
        return hasPermission(item.permissionModule, 'visualizar');
    };

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    const asideClasses = theme === 'light'
        ? 'bg-white border-r border-[#E2E8F0]'
        : 'bg-[#002B49] border-r border-slate-800/50';

    const logo = isOpen
        ? <LogoFull dark={theme === 'light' ? true : false} /> // Dark logo (black text) on light bg
        : <LogoIcon dark={theme === 'light' ? true : false} className="w-8 h-8" />;

    const toggleButtonClasses = theme === 'light'
        ? 'bg-[#00A3B1] border-2 border-white hover:bg-[#008c99]'
        : 'bg-[#00A3B1] border-2 border-[#002B49] hover:bg-[#008c99]';

    const profileCardClasses = theme === 'light'
        ? 'bg-white border border-slate-200 shadow-sm hover:bg-slate-50'
        : 'bg-white p-2 border border-slate-200 shadow-sm'; // Kept original style for dark mode (white card on dark bg)

    return (
        <aside className={`${asideClasses} transition-all duration-300 flex flex-col relative z-30 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className={`h-20 px-6 flex items-center ${isOpen ? 'justify-start' : 'justify-center'}`}>
                {logo}
            </div>

            <button
                onClick={onToggle}
                className={`absolute -right-3 top-7 z-50 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform ${!isOpen && 'rotate-180'} ${toggleButtonClasses}`}
            >
                <ChevronLeft size={16} strokeWidth={3} />
            </button>

            <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto no-scrollbar">
                {items.filter(canShow).map(item => {
                    const filteredSubItems = item.subItems?.filter(canShow);
                    const itemWithFilteredSubs = { ...item, subItems: filteredSubItems };

                    if (item.subItems && filteredSubItems?.length === 0) return null;

                    return itemWithFilteredSubs.subItems ? (
                        <NavGroup
                            key={item.id}
                            item={itemWithFilteredSubs}
                            activeTab={activeTab}
                            isOpen={isOpen}
                            onTabChange={onTabChange}
                            expandedMenus={expandedMenus}
                            toggleMenu={toggleMenu}
                            theme={theme}
                        />
                    ) : (
                        <NavItem
                            key={item.id}
                            item={itemWithFilteredSubs}
                            activeTab={activeTab}
                            isOpen={isOpen}
                            onTabChange={onTabChange}
                            theme={theme}
                        />
                    );
                })}
            </nav>

            <div className={`p-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-white/10'}`}>
                <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${!isOpen && 'justify-center'} ${profileCardClasses}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-slate-400" size={20} />
                        )}
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#002B49] truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                    )}
                    {isOpen && (
                        <button onClick={onLogout} className="text-slate-300 hover:text-red-500 transition-colors">
                            <LogOut size={14} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
