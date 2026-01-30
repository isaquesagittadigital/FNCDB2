
import {
    LayoutDashboard,
    Calendar,
    User,
    FolderOpen
} from 'lucide-react';
import { SidebarItem } from '../layout/Sidebar';

export const clientMenu: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Meus documentos', icon: FolderOpen },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'profile', label: 'Meus dados', icon: User },
];
