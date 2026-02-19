
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import DashboardLayout from '../layout/DashboardLayout';
import ClientDashboard from './ClientDashboard';
import ClientOnboarding from '../onboarding/ClientOnboarding';

import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import { clientMenu } from './menu';
import { getTabFromSlug, getRoutePath } from '../../lib/routes';

interface ClientFlowProps {
    onLogout: () => void;
    userProfile?: any;
}

const ClientFlow: React.FC<ClientFlowProps> = ({ onLogout, userProfile }) => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Derive activeTab from URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    // URL: /cliente/<slug>
    const slug = pathParts[1] || 'dashboard';
    const activeTab = getTabFromSlug('client', slug);

    useEffect(() => {
        if (userProfile) {
            if (userProfile.onboarding_finalizado === true) {
                setShowOnboarding(false);
            } else {
                setShowOnboarding(true);
            }
        }
    }, [userProfile]);

    const handleOnboardingFinish = () => {
        setShowOnboarding(false);
    };

    if (showOnboarding) {
        return <ClientOnboarding onFinish={handleOnboardingFinish} />;
    }

    const handleTabChange = (tabId: string) => {
        const path = getRoutePath('client', tabId);
        navigate(path);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ClientDashboard />;
            case 'calendar': return <CalendarView role="client" userId={userProfile?.id} />;
            case 'notifications': return <NotificationsView />;
            case 'documents': return <DocumentsView userProfile={userProfile} />;
            case 'profile': return <ProfileView readOnly={true} />;
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
            onTabChange={handleTabChange}
            user={{
                name: userProfile?.nome_fantasia || userProfile?.razao_social || userProfile?.nome || 'Cliente',
                email: userProfile?.email || 'cliente@fncdcapital.com'
            }}
            onLogout={onLogout}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default ClientFlow;
