
import React from 'react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
    user: {
        avatarUrl?: string;
    };
    activeTab: string;
    onNotificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, onNotificationClick }) => {
    return (
        <header className="bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-end gap-6 z-10">
            <button
                onClick={onNotificationClick}
                className={`relative transition-colors ${activeTab === 'notifications' ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#00A3B1]'}`}
            >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
