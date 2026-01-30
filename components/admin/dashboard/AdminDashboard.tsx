
import React from 'react';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import EvolutionChart from './EvolutionChart';
import ContractsTable from './ContractsTable';
import NewClientsTable from './NewClientsTable';

const AdminDashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardHeader />

            <KPICards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EvolutionChart />
                {/* Placeholder for future component or just layout balancing */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[300px]">
                    <p className="text-slate-400 italic">Espaço para métricas adicionais</p>
                </div>
            </div>

            <ContractsTable />

            <NewClientsTable />
        </div>
    );
};

export default AdminDashboard;
