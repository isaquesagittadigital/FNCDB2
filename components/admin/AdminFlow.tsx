
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
import Simulator from './simulator/Simulator';
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

import { adminMenu } from './menu';

// Mock Data
const MOCK_PROCESSES: ApprovalProcess[] = [
    {
        id: '1',
        clientName: 'Isaque testes da silva',
        consultantName: 'Samuel Alves',
        contractCode: '23042849',
        amount: 30000,
        documentId: '047.253.905-18',
        status: 'approved',
        steps: [
            { id: '1-1', title: 'Comprovante anexado', description: 'Verificar se o consultor assinou o contrato de prestação de serviços', status: 'approved', hasDocument: true },
            { id: '1-2', title: 'Perfil do investidor', description: 'Confirmar que o consultor completou todo o processo de verificação KYC', status: 'approved', hasDocument: true },
            { id: '1-3', title: 'Assinatura do contrato', description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários', status: 'approved', hasDocument: true }
        ]
    },
    {
        id: '2',
        clientName: 'Samuel Alves de Souza',
        consultantName: 'Ricardo Ricchini Contesini',
        contractCode: '15388767',
        amount: 49000,
        documentId: '416.255.138-36',
        status: 'approved',
        steps: []
    },
    {
        id: '3',
        clientName: 'Samuel Alves de Souza',
        consultantName: 'Renan Furlan Rigo 4',
        contractCode: '17900772',
        amount: 10000,
        documentId: '416.255.138-36',
        status: 'pending',
        steps: [
            { id: '3-1', title: 'Comprovante anexado', description: 'Verificar se o consultor assinou o contrato de prestação de serviços', status: 'pending', hasDocument: true },
            { id: '3-2', title: 'Perfil do investidor', description: 'Confirmar que o consultor completou todo o processo de verificação KYC', status: 'approved', hasDocument: true },
            { id: '3-3', title: 'Assinatura do contrato', description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários', status: 'pending', hasDocument: true }
        ]
    },
    {
        id: '4',
        clientName: 'Renan Furlan Rigo',
        consultantName: 'Renan Furlan Rigo 4',
        contractCode: '65119068',
        amount: 10000,
        documentId: '345.255.618-23',
        status: 'approved',
        steps: []
    },
    {
        id: '5',
        clientName: 'Carlos Casa Nova',
        consultantName: 'Jacson Daniel de Almeida dos Santos',
        contractCode: '05515482',
        amount: 51000,
        documentId: '047.253.905-79',
        status: 'approved',
        steps: []
    },
    {
        id: '6',
        clientName: 'Samuel Alves de Souza',
        consultantName: 'Samuel Alves',
        contractCode: '58022482',
        amount: 50000,
        documentId: '416.255.138-36',
        status: 'pending',
        steps: [
            { id: '6-1', title: 'Comprovante anexado', description: 'Verificar se o consultor assinou o contrato de prestação de serviços', status: 'pending', hasDocument: true },
            { id: '6-2', title: 'Perfil do investidor', description: 'Confirmar que o consultor completou todo o processo de verificação KYC', status: 'pending', hasDocument: true },
            { id: '6-3', title: 'Assinatura do contrato', description: 'Verificar se o consultor anexou todos os documentos comprobatórios necessários', status: 'pending', hasDocument: true }
        ]
    }
];

interface AdminFlowProps {
    onLogout: () => void;
}

const AdminFlow: React.FC<AdminFlowProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [processes, setProcesses] = useState<ApprovalProcess[]>(MOCK_PROCESSES);
    const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

    const handleViewDetails = (process: ApprovalProcess) => {
        setSelectedProcessId(process.id);
    };

    const handleUpdateStepStatus = (stepId: string, status: 'approved' | 'rejected', reason?: string) => {
        setProcesses(prev => prev.map(p => {
            if (p.id === selectedProcessId) {
                return {
                    ...p,
                    steps: p.steps.map(s => s.id === stepId ? { ...s, status, rejectionReason: reason } : s)
                };
            }
            return p;
        }));
    };

    const handleFinalizeProcess = (approved: boolean) => {
        setProcesses(prev => prev.map(p => {
            if (p.id === selectedProcessId) {
                return {
                    ...p,
                    status: approved ? 'approved' : 'rejected'
                };
            }
            return p;
        }));
        setSelectedProcessId(null); // Go back to list
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'simulation':
                return <Simulator />;
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
                return <ContractsView />;
            case 'invoices':
            case 'income_reports':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Cadastros / {activeTab}</h1>
                        <p className="text-slate-400">Gerenciamento de {activeTab}.</p>
                    </div>
                );
            case 'reports':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Relatórios</h1>
                        <p className="text-slate-400">Visualização de relatórios.</p>
                    </div>
                );
            case 'detailed_portfolio':
            case 'portfolio_report':
            case 'monthly_commission':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Relatórios / {activeTab}</h1>
                        <p className="text-slate-400">Relatório de {activeTab}.</p>
                    </div>
                );
            case 'payments':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-[#002B49]">Pagamentos</h1>
                        <p className="text-slate-400">Gerenciamento de pagamentos.</p>
                    </div>
                );
            case 'administrators':
                return <UsersView />;
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
            onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'approval') setSelectedProcessId(null);
            }}
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
