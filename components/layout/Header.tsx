import React, { useEffect, useState, useRef } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
    user: {
        name?: string;
        email?: string;
        avatarUrl?: string;
    };
    activeTab: string;
    onNotificationClick: () => void;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, onNotificationClick, onLogout }) => {
    const [hasUnread, setHasUnread] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

        const channel = supabase
            .channel('header_notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notificacoes'
                },
                () => {
                    checkUnread();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'notifications') {
            const timer = setTimeout(() => { }, 1000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <header className="bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-end gap-6 z-10">
            <button
                onClick={onNotificationClick}
                className={`relative transition-colors ${activeTab === 'notifications' ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#00A3B1]'}`}
            >
                <Bell size={20} />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {/* Profile avatar + dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-[#002B49] hover:bg-slate-50 transition-colors overflow-hidden"
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className="text-slate-400" />
                    )}
                </button>

                {menuOpen && (
                    <div
                        className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                        style={{ animation: 'fadeIn 0.15s ease-out' }}
                    >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-slate-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#002B49] truncate">
                                    {user.name || 'Usuário'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user.email || ''}
                                </p>
                            </div>
                        </div>

                        {/* Logout button */}
                        {onLogout && (
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onLogout();
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <LogOut size={16} className="text-slate-400" />
                                Sair
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </header>
    );
};

export default Header;
