
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen,
    Settings,
    Users
} from 'lucide-react';

import AdminDashboard from './dashboard/AdminDashboard';
import DashboardLayout from '../layout/DashboardLayout';
import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import { adminMenu } from './menu';

interface AdminFlowProps {
    onLogout: () => void;
}

const AdminFlow: React.FC<AdminFlowProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            // ...
            case 'users':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Gerenciamento de Usuários</h1>
                        <p className="text-slate-400">Lista de usuários do sistema.</p>
                    </div>
                );
            case 'calendar': return <CalendarView />;
            case 'notifications': return <NotificationsView />;
            case 'documents': return <DocumentsView />;
            case 'profile': return <ProfileView />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-slate-400 italic">
                        Seção "{activeTab}" em desenvolvimento...
                    </div>
                );
        }
    };

    return (
        <DashboardLayout
            sidebarItems={adminMenu}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={{
                name: 'Administrador',
                email: 'admin@fncdcapital.com'
            }}
            onLogout={onLogout}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default AdminFlow;
