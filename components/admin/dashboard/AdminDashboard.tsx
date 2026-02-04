
import React from 'react';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import ContractsTable from './ContractsTable';
import NewClientsTable from './NewClientsTable';

const AdminDashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardHeader />

            <KPICards />

            <ContractsTable />

            <NewClientsTable />
        </div>
    );
};

export default AdminDashboard;
