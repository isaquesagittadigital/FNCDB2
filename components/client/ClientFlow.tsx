
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen
} from 'lucide-react';

import DashboardLayout from '../layout/DashboardLayout';
import ClientDashboard from './ClientDashboard';

import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import { clientMenu } from './menu';

interface ClientFlowProps {
    onLogout: () => void;
}

const ClientFlow: React.FC<ClientFlowProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ClientDashboard />;
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
            sidebarItems={clientMenu}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={{
                name: 'Samuel Alves de Souza',
                email: 'samuel.alves@fncdcapital.com' // Example email
            }}
            onLogout={onLogout}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default ClientFlow;
