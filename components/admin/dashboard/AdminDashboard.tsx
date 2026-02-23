
import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import ContractsTable from './ContractsTable';
import NewClientsTable from './NewClientsTable';

export interface DateRange {
    start: string | null;
    end: string | null;
}

interface AdminDashboardProps {
    onViewAllContracts?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewAllContracts }) => {
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DashboardHeader onDateRangeChange={setDateRange} />

            <KPICards dateRange={dateRange} />

            <ContractsTable onViewAllContracts={onViewAllContracts} dateRange={dateRange} />

            <NewClientsTable dateRange={dateRange} />
        </div>
    );
};

export default AdminDashboard;
