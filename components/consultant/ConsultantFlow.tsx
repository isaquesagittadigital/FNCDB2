
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    CheckCircle2,
    ShieldCheck,
    Users,
    Receipt,
    FileSpreadsheet,
    BarChart3,
    Briefcase,
    FolderOpen
} from 'lucide-react';

import DashboardLayout from '../layout/DashboardLayout';
import ConsultantDashboard from './ConsultantDashboard';
import ApprovalsView from './ApprovalsView';
import ClientsView from './ClientsView';
import ContractsView from './ContractsView';
import InvoicesView from './InvoicesView';

import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import { consultantMenu } from './menu';

interface ConsultantFlowProps {
    onLogout: () => void;
}

const ConsultantFlow: React.FC<ConsultantFlowProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ConsultantDashboard />;
            case 'approval': return <ApprovalsView />;
            case 'clients': return <ClientsView />;
            case 'contracts': return <ContractsView />;
            case 'invoice': return <InvoicesView />;
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
            sidebarItems={consultantMenu}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={{
                name: 'Carla Gandolfo',
                email: 'carlagandolgo@fncdcapital.com'
            }}
            onLogout={onLogout}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default ConsultantFlow;
