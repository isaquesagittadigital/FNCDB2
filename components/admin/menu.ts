
import {
    LayoutDashboard,
    CheckCircle,
    PlusSquare,
    FileText,
    PieChart,
    Calendar,
    CreditCard,
    User,
    Users
} from 'lucide-react';
import { SidebarItem } from '../layout/Sidebar';

export const adminMenu: SidebarItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
    },
    {
        id: 'approval',
        label: 'Aprovação',
        icon: CheckCircle
    },
    {
        id: 'registrations',
        label: 'Cadastros',
        icon: PlusSquare,
        subItems: [
            { id: 'consultants', label: 'Consultores', icon: Users },
            { id: 'contracts', label: 'Contratos', icon: FileText },
            { id: 'invoices', label: 'Nota fiscal', icon: FileText },
            { id: 'income_reports', label: 'Informe de rendimentos', icon: FileText }
        ]
    },
    {
        id: 'reports',
        label: 'Relatórios',
        icon: PieChart,
        subItems: [
            { id: 'detailed_portfolio', label: 'Carteira detalhada', icon: FileText },
            { id: 'portfolio_report', label: 'Relatório: Carteiras', icon: FileText },
            { id: 'monthly_commission', label: 'Comissão mensal', icon: CreditCard }
        ]
    },
    {
        id: 'calendar',
        label: 'Calendário',
        icon: Calendar
    },
    {
        id: 'payments',
        label: 'Gerenciar pagamentos',
        icon: CreditCard
    },
    {
        id: 'profile',
        label: 'Meus dados',
        icon: User
    },
    {
        id: 'administrators',
        label: 'Administradores',
        icon: Users
    }
];
