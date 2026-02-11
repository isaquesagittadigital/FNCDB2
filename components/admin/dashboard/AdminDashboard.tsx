
import React from 'react';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import ContractsTable from './ContractsTable';
import NewClientsTable from './NewClientsTable';

interface AdminDashboardProps {
    onViewAllContracts?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewAllContracts }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardHeader />

            <KPICards />

            <ContractsTable onViewAllContracts={onViewAllContracts} />

            <NewClientsTable />
        </div>
    );
};

export default AdminDashboard;
