
import {
    LayoutDashboard,
    CheckCircle,
    PlusSquare,
    FileText,
    PieChart,
    Calendar,
    Calculator,
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
        icon: CheckCircle,
        permissionModule: 'aprovacao'
    },
    {
        id: 'registrations',
        label: 'Cadastros',
        icon: PlusSquare,
        subItems: [
            { id: 'clients', label: 'Clientes', icon: Users, permissionModule: 'clientes' },
            { id: 'consultants', label: 'Consultores', icon: Users, permissionModule: 'consultores' },
            { id: 'contracts', label: 'Contratos', icon: FileText, permissionModule: 'contratos' },
            { id: 'invoices', label: 'Nota fiscal', icon: FileText, permissionModule: 'nota_fiscal' },
            { id: 'income_reports', label: 'Informe de rendimentos', icon: FileText, permissionModule: 'informe_rendimentos' }
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
        icon: Calendar,
        permissionModule: 'calendario'
    },
    {
        id: 'payments',
        label: 'Pagamentos',
        icon: CreditCard,
        permissionModule: 'gerenciar_pagamentos',
        subItems: [
            { id: 'dividends', label: 'Dividendos', icon: CreditCard },
            { id: 'commissions', label: 'Comissões', icon: CreditCard },
            { id: 'leader_commissions', label: 'Comissões do Líder', icon: CreditCard }
        ]
    },
    {
        id: 'simulation',
        label: 'Simulação',
        icon: Calculator
    },
    {
        id: 'profile',
        label: 'Meus dados',
        icon: User
    },
    {
        id: 'administrators',
        label: 'Usuarios',
        icon: Users,
        permissionModule: 'usuarios'
    }
];
