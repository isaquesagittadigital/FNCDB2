
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen
} from 'lucide-react';

import DashboardLayout from '../layout/DashboardLayout';
import ClientDashboard from './ClientDashboard';
import ClientOnboarding from '../onboarding/ClientOnboarding';

import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import { clientMenu } from './menu';

interface ClientFlowProps {
    onLogout: () => void;
    userProfile?: any;
}

const ClientFlow: React.FC<ClientFlowProps> = ({ onLogout, userProfile }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (userProfile) {
            // DB is the source of truth. 
            // If onboarding_finalizado is explicitly true, show dashboard.
            // Otherwise, show onboarding.
            if (userProfile.onboarding_finalizado === true) {
                setShowOnboarding(false);
            } else {
                setShowOnboarding(true);
            }
        }
    }, [userProfile]);

    const handleOnboardingFinish = () => {
        // Optimistically update local state to show dashboard
        setShowOnboarding(false);
        // Optionally update the userProfile in parent if possible, but for now this hides the onboarding
    };

    if (showOnboarding) {
        return <ClientOnboarding onFinish={handleOnboardingFinish} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ClientDashboard />;
            case 'calendar': return <CalendarView />;
            case 'notifications': return <NotificationsView />;

            case 'documents': return <DocumentsView userProfile={userProfile} />;
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
