
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
    LayoutGrid
} from 'lucide-react';
import { SidebarItem } from '../layout/Sidebar';

export const consultantMenu: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulator', label: 'Simulador', icon: LayoutGrid },
    {
        id: 'cadastros',
        label: 'Cadastros',
        icon: ShieldCheck,
        subItems: [
            { id: 'clients', label: 'Clientes', icon: Users },
            { id: 'contracts', label: 'Contratos', icon: FileText },
            { id: 'invoice', label: 'Nota fiscal', icon: Receipt },
            { id: 'yields', label: 'Informe de rendimentos', icon: FileSpreadsheet },
        ]
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        icon: BarChart3,
        subItems: [
            { id: 'reports_detailed', label: 'Carteira detalhada', icon: Briefcase },
            { id: 'reports_portfolios', label: 'Relatório: Carteiras', icon: FileSpreadsheet },
            { id: 'reports_commission', label: 'Comissão mensal', icon: Receipt },
        ]
    },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'profile', label: 'Meus dados', icon: User },
];
