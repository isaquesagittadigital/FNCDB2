import React from 'react';
import { Plus, Home, ChevronRight, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import SuccessModal from '../../shared/ui/SuccessModal';
import PermissionsModal from './PermissionsModal';
import { Shield, Settings } from 'lucide-react';

const UsersView = () => {
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = React.useState<any>(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<any>(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = React.useState<any>(null);
    const [lastCreatedUser, setLastCreatedUser] = React.useState<any>(null);

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('deletado', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (data: any) => {
        try {
            const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erro ao criar usuário');
            }

            // Refresh list
            fetchUsers();

            // Show Success Modal
            setLastCreatedUser(data);
            setIsSuccessModalOpen(true);
        } catch (error: any) {
            alert(error.message);
            throw error;
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            leader: "bg-cyan-100 text-cyan-800 border-cyan-200",
            operator: "bg-teal-50 text-teal-700 border-teal-100",
            super_admin: "bg-sky-50 text-sky-700 border-sky-100"
        };

        // Map Admin/Consultor to visual roles if needed, or just display raw
        // For now displaying raw tipo_user if no mapping matches
        let style = styles.super_admin;
        let displayRole = role;

        if (role === 'Admin' || role === 'Super Admin') { displayRole = role; style = styles.super_admin; }
        else if (role === 'Consultor' || role === 'Operador') { displayRole = role; style = styles.operator; }
        else if (role === 'Lider' || role === 'Líder') { displayRole = role; style = styles.leader; }
        else if (role === 'Cliente') { displayRole = 'Cliente'; style = styles.leader; }

        return (
            <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${style}`}>
                {displayRole}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onConfirm={handleCreateUser}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Usuário cadastrado!"
                message={`O cadastro de ${lastCreatedUser?.nome_fantasia || 'novo usuário'} foi realizado. Um e-mail de boas-vindas foi enviado para ${lastCreatedUser?.email || 'o endereço informado'}.`}
            />

            <PermissionsModal
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                onUpdate={fetchUsers}
                user={selectedUserForPermissions}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={fetchUsers}
                user={selectedUserForEdit}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onUpdate={fetchUsers}
                user={selectedUserForDelete}
            />

            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Usuários</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    Cadastrar usuários
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4 pl-2">Nome</div>
                    <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-slate-700">
                        Email
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-slate-700">
                        Usuário
                        <ArrowUpDown size={12} />
                    </div>
                    <div className="col-span-2 text-center"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Carregando usuários...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Nenhum usuário encontrado.</div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group"
                            >
                                <div className="col-span-4 pl-2 font-medium text-slate-700 text-sm">
                                    {user.nome_fantasia || user.razao_social || user.nome || 'Sem nome'}
                                </div>
                                <div className="col-span-4 text-slate-500 text-sm truncate" title={user.email}>
                                    {user.email}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    {getRoleBadge(user.tipo_perfil_usuario || user.tipo_user)}
                                </div>
                                <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                                    <button
                                        onClick={() => {
                                            setSelectedUserForEdit(user);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-[#009BB6] hover:bg-cyan-50 rounded-lg transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUserForPermissions(user);
                                            setIsPermissionsModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Permissões"
                                    >
                                        <Shield size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedUserForDelete(user);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Inativar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UsersView;
