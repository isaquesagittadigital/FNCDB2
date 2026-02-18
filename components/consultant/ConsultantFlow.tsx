
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    ShieldCheck,
    Users,
    Receipt,
    FileSpreadsheet,
    BarChart3,
    Briefcase,
    FolderOpen
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import DashboardLayout from '../layout/DashboardLayout';
import ConsultantDashboard from './ConsultantDashboard';
import ApprovalsView from './ApprovalsView';
import ClientsView from './ClientsView';
import ContractsView from './ContractsView';
import InvoicesView from './InvoicesView';
import Simulator from '../admin/simulator/Simulator';

import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from './ConsultantProfileView';

import { consultantMenu } from './menu';
import { getTabFromSlug, getRoutePath } from '../../lib/routes';

interface ConsultantFlowProps {
    onLogout: () => void;
    userProfile?: any;
    onOpenSimulator?: () => void;
}

const ConsultantFlow: React.FC<ConsultantFlowProps> = ({ onLogout, userProfile, onOpenSimulator }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Derive activeTab from URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    // URL: /consultor/<slug>
    const slug = pathParts[1] || 'dashboard';
    const activeTab = getTabFromSlug('consultant', slug);

    const handleTabChange = (tabId: string) => {
        const path = getRoutePath('consultant', tabId);
        navigate(path);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ConsultantDashboard userProfile={userProfile} />;
            case 'simulator': return <Simulator onOpen={onOpenSimulator} />;
            case 'approval': return <ApprovalsView />;
            case 'clients': return <ClientsView userProfile={userProfile} />;
            case 'contracts': return <ContractsView userProfile={userProfile} />;
            case 'invoice': return <InvoicesView userProfile={userProfile} />;
            case 'calendar': return <CalendarView role="consultant" userId={userProfile?.id} />;
            case 'notifications': return <NotificationsView />;
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
            onTabChange={handleTabChange}
            user={{
                name: userProfile?.nome_fantasia || userProfile?.razao_social || userProfile?.nome || 'Consultor',
                email: userProfile?.email || 'consultor@fncdcapital.com',
                avatarUrl: userProfile?.foto_perfil || userProfile?.avatar_url
            }}
            onLogout={onLogout}
            sidebarTheme="light"
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default ConsultantFlow;
