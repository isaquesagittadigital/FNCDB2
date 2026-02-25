
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen,
    Settings,
    Users
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import AdminDashboard from './dashboard/AdminDashboard';
import SimulatorRedirectView from '../simulator/SimulatorRedirectView';
import UsersView from './users/UsersView';
import ConsultantsView from './consultants/ConsultantsView';
import ContractsView from './contracts/ContractsView';
import DashboardLayout from '../layout/DashboardLayout';
import CalendarView from '../shared/CalendarView';
import NotificationsView from '../shared/NotificationsView';
import DocumentsView from '../shared/DocumentsView';
import ProfileView from '../shared/ProfileView';

import ApprovalList from './approval/ApprovalList';
import ApprovalDetails from './approval/ApprovalDetails';
import { ApprovalProcess } from './approval/types';
import ClientsView from './clients/ClientsView';
import InvoicesView from './invoices/InvoicesView';
import SuccessModal from '../shared/ui/SuccessModal';
import EmptyState from '../shared/ui/EmptyState';

import DividendsView from './payments/DividendsView';
import CommissionsView from './payments/CommissionsView';
import LeaderCommissionsView from './payments/LeaderCommissionsView';

import { adminMenu } from './menu';
import { getTabFromSlug, getRoutePath } from '../../lib/routes';

interface AdminFlowProps {
    onLogout: () => void;
    onOpenSimulator?: () => void;
    userProfile?: any;
}

const AdminFlow: React.FC<AdminFlowProps> = ({ onLogout, onOpenSimulator, userProfile }) => {
    const [processes, setProcesses] = useState<ApprovalProcess[]>([]);
    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
    const [loadingProcesses, setLoadingProcesses] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState({ title: '', message: '' });

    const location = useLocation();
    const navigate = useNavigate();

    // Derive activeTab from URL
    const pathParts = location.pathname.split('/').filter(Boolean);
    // URL: /admin/<slug>
    const slug = pathParts[1] || 'dashboard';
    const activeTab = getTabFromSlug('admin', slug);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

    // Fetch approval processes from API
    const fetchProcesses = async () => {
        setLoadingProcesses(true);
        try {
            const res = await fetch(`${API_URL}/admin/approval/processes`);
            if (!res.ok) throw new Error('Falha ao buscar processos');
            const data = await res.json();
            setProcesses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[AdminFlow] Error fetching processes:', err);
        } finally {
            setLoadingProcesses(false);
        }
    };

    // Fetch processes when approval tab is selected
    React.useEffect(() => {
        if (activeTab === 'approval') {
            fetchProcesses();
        }
    }, [activeTab]);

    const handleViewDetails = (process: ApprovalProcess) => {
        setSelectedProcessId(process.id);
    };

    const handleUpdateStepStatus = async (stepId: string, status: 'approved' | 'rejected', reason?: string) => {
        const parts = stepId.split('-');
        const stepType = parts[parts.length - 1];
        const contractId = selectedProcessId;

        if (!contractId) return;

        try {
            const res = await fetch(`${API_URL}/admin/approval/process/${contractId}/step`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: stepType, status, reason })
            });

            if (!res.ok) throw new Error('Falha ao atualizar step');

            setProcesses(prev => prev.map(p => {
                if (p.id === contractId) {
                    return {
                        ...p,
                        steps: p.steps.map(s => s.id === stepId ? { ...s, status, rejectionReason: reason } : s)
                    };
                }
                return p;
            }));
        } catch (err) {
            console.error('[AdminFlow] Error updating step:', err);
            alert('Erro ao atualizar etapa. Tente novamente.');
        }
    };

    const handleFinalizeProcess = async (approved: boolean, data_ativacao?: string, observacao?: string) => {
        const contractId = selectedProcessId;
        if (!contractId) return;

        try {
            const res = await fetch(`${API_URL}/admin/approval/process/${contractId}/finalize`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved, data_ativacao, observacao })
            });

            if (!res.ok) throw new Error('Falha ao finalizar processo');

            setProcesses(prev => prev.map(p => {
                if (p.id === contractId) {
                    return {
                        ...p,
                        status: approved ? 'approved' : 'rejected',
                        contractStatus: approved ? 'Vigente' : 'Reprovado'
                    };
                }
                return p;
            }));

            if (approved) {
                setSuccessData({
                    title: 'Processo Finalizado!',
                    message: 'O contrato foi ativado com sucesso e o cronograma de pagamentos foi gerado.'
                });
                setShowSuccessModal(true);
            }

            setSelectedProcessId(null);
        } catch (err) {
            console.error('[AdminFlow] Error finalizing process:', err);
            alert('Erro ao finalizar processo. Tente novamente.');
        }
    };

    const handleTabChange = (tabId: string) => {
        const path = getRoutePath('admin', tabId);
        navigate(path);
        if (tabId !== 'approval') setSelectedProcessId(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard onViewAllContracts={() => handleTabChange('contracts')} />;
            case 'simulation':
                return <SimulatorRedirectView />;
            case 'approval':
                if (selectedProcessId) {
                    const process = processes.find(p => p.id === selectedProcessId);
                    if (process) {
                        return (
                            <ApprovalDetails
                                process={process}
                                onBack={() => setSelectedProcessId(null)}
                                onUpdateStepStatus={handleUpdateStepStatus}
                                onFinalizeProcess={handleFinalizeProcess}
                            />
                        );
                    }
                }
                return <ApprovalList processes={processes} onViewDetails={handleViewDetails} />;
            case 'clients':
                return <ClientsView />;
            case 'registrations':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Cadastros</h1>
                        <p className="text-slate-400">Gerenciamento de cadastros.</p>
                    </div>
                );
            case 'consultants':
                return <ConsultantsView />;
            case 'contracts':
                return <ContractsView userProfile={userProfile} />;
            case 'invoices':
                return <InvoicesView />;
            case 'income_reports':
                return (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-[#002B49]">Informe de rendimentos</h1>
                        <EmptyState
                            title="Em desenvolvimento"
                            description="O fluxo de informes de rendimentos está sendo preparado e estará disponível em breve."
                        />
                    </div>
                );
            case 'detailed_portfolio':
            case 'portfolio_report':
            case 'monthly_commission':
                const reportTitles: any = {
                    'detailed_portfolio': 'Carteira detalhada',
                    'portfolio_report': 'Relatório: Carteiras',
                    'monthly_commission': 'Comissão mensal'
                };
                return (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-[#002B49]">{reportTitles[activeTab]}</h1>
                        <EmptyState
                            title="Seção em desenvolvimento"
                            description={`O relatório de ${reportTitles[activeTab].toLowerCase()} está em fase de implementação.`}
                        />
                    </div>
                );
            case 'dividends':
                return <DividendsView />;
            case 'commissions':
                return <CommissionsView />;
            case 'leader_commissions':
                return <LeaderCommissionsView />;
            case 'payments':
                return (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-[#002B49]">Pagamentos</h1>
                        <EmptyState
                            title="Módulo de Pagamentos"
                            description="Selecione uma das opções no menu esquerdo (Dividendos, Comissões ou Comissões de Líder) para iniciar."
                        />
                    </div>
                );
            case 'administrators':
                return <UsersView />;
            case 'calendar': return <CalendarView role="admin" />;
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
            onTabChange={handleTabChange}
            user={{
                name: userProfile?.nome_fantasia || userProfile?.razao_social || userProfile?.nome || 'Administrador',
                email: userProfile?.email || 'admin@fncdcapital.com',
                avatarUrl: userProfile?.foto_perfil || userProfile?.avatar_url
            }}
            onLogout={onLogout}
            sidebarTheme="light"
        >
            {renderContent()}

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={successData.title}
                message={successData.message}
            />
        </DashboardLayout>
    );
};

export default AdminFlow;
