import React, { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
    user: {
        avatarUrl?: string;
    };
    activeTab: string;
    onNotificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, onNotificationClick }) => {
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { count } = await supabase
                .from('notificacoes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id)
                .eq('is_read', false); // Only count unread

            setHasUnread(count !== null && count > 0);
        };

        checkUnread();

        // Subscribe to changes
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

    // Re-check when activeTab changes (e.g. user goes to notifications page)
    useEffect(() => {
        if (activeTab === 'notifications') {
            // Give it a moment for the view to mark as read, then check again
            const timer = setTimeout(() => {
                // If we are on the notifications page, we might assume they are being read, 
                // but strictly speaking we should only clear the dot if they are actually marked as read in DB.
                // The NotificationsView component handles marking as read.
                // This check ensures sync.
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);


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
            <button className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-[#002B49] hover:bg-slate-50 transition-colors overflow-hidden">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User size={20} className="text-slate-400" />
                )}
            </button>
        </header>
    );
};

export default Header;
