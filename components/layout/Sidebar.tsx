
import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronDown,
    LogOut,
    User,
    Menu
} from 'lucide-react';
import { LogoIcon, LogoFull } from '../shared/ui/Logo';

export interface SidebarItem {
    id: string;
    label: string;
    icon: any;
    subItems?: SidebarItem[];
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
}

const Sidebar: React.FC<SidebarProps> = ({
    items,
    activeTab,
    onTabChange,
    user,
    onLogout,
    isOpen,
    onToggle
}) => {
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    // Check if a parent menu should be active (if one of its children is active)
    const isParentActive = (item: SidebarItem) => {
        if (!item.subItems) return false;
        return item.subItems.some(sub => sub.id === activeTab);
    };

    const NavItem = ({ item, isSub = false }: { item: SidebarItem, isSub?: boolean }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
            <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                    ? 'bg-[#E6F6F7] text-[#00A3B1] font-bold shadow-sm'
                    : 'text-[#64748B] hover:bg-slate-50 font-medium'
                    } ${isSub ? 'pl-10 text-xs' : ''}`}
            >
                <Icon size={isSub ? 16 : 20} className={isActive ? 'text-[#00A3B1]' : 'text-[#64748B]'} />
                {isOpen && <span className="truncate">{item.label}</span>}
            </button>
        );
    };

    const NavGroup = ({ item }: { item: SidebarItem }) => {
        const Icon = item.icon;
        const hasActiveChild = isParentActive(item);

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-[#64748B] hover:bg-slate-50 font-medium rounded-xl group transition-all ${hasActiveChild ? 'text-[#002B49] bg-slate-50' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Icon size={20} className={hasActiveChild ? 'text-[#00A3B1]' : 'text-[#64748B]'} />
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
                            <NavItem key={sub.id} item={sub} isSub />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className={`bg-white border-r border-slate-100 transition-all duration-300 flex flex-col relative z-30 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className={`h-20 px-6 flex items-center ${isOpen ? 'justify-start' : 'justify-center'}`}>
                {isOpen ? <LogoFull dark={true} /> : <LogoIcon dark={true} className="w-8 h-8" />}
            </div>

            <button
                onClick={onToggle}
                className={`absolute -right-3 top-7 z-50 w-7 h-7 bg-[#00A3B1] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:bg-[#008c99] transition-all transform ${!isOpen && 'rotate-180'}`}
            >
                <ChevronLeft size={16} strokeWidth={3} />
            </button>

            <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto no-scrollbar">
                {items.map(item => (
                    item.subItems ? (
                        <NavGroup key={item.id} item={item} />
                    ) : (
                        <NavItem key={item.id} item={item} />
                    )
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className={`flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm ${!isOpen && 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        <User className="text-slate-400" size={20} />
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
