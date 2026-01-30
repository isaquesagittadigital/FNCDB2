import React from 'react';
import { Plus, Home, ChevronRight, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const UsersView = () => {
    // Mock data based on the image
    const users = [
        { id: 1, name: 'Hendrix Aponte', email: 'jhimmy.hendrix@fncd.com.br', role: 'Líder', roleType: 'leader' },
        { id: 2, name: 'victor.hugo', email: 'victor.hugo@sagittadigital.com.br', role: 'Operador', roleType: 'operator' },
        { id: 3, name: 'Henri A Aponte', email: 'henri.aponte@fncd.com.br', role: 'Super Admin', roleType: 'super_admin' },
        { id: 4, name: 'Rian Marcos Sanchez Leandro Batista', email: 'rian.sanchez@fncd.com.br', role: 'Operador', roleType: 'operator' },
        { id: 5, name: 'Carla Gandolfo', email: 'carla.gandolfo@fncd.com.br', role: 'Super Admin', roleType: 'super_admin' },
        { id: 6, name: 'FNCD CAPITAL', email: 'suporte@fncdcapital.com.br', role: 'Super Admin', roleType: 'super_admin' },
        { id: 7, name: 'Samuel Alves', email: 'samuel.alves@fncd.com.br', role: 'Super Admin', roleType: 'super_admin' },
    ];

    const getRoleBadge = (role: string) => {
        const styles = {
            leader: "bg-cyan-100 text-cyan-800 border-cyan-200",
            operator: "bg-teal-50 text-teal-700 border-teal-100",
            super_admin: "bg-sky-50 text-sky-700 border-sky-100"
        };

        let style = styles.super_admin;
        if (role === 'Líder') style = styles.leader;
        if (role === 'Operador') style = styles.operator;

        return (
            <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${style}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Breadcrumbs and Action Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={14} />
                        <span className="text-slate-700 font-medium">Usuários</span>
                    </div>
                </div>

                <button className="bg-[#009BB6] hover:bg-[#008f9e] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                    <Plus size={18} />
                    Cadastrar administrador
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
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group"
                        >
                            <div className="col-span-4 pl-2 font-medium text-slate-700 text-sm">
                                {user.name}
                            </div>
                            <div className="col-span-4 text-slate-500 text-sm truncate" title={user.email}>
                                {user.email}
                            </div>
                            <div className="col-span-2 flex justify-center">
                                {getRoleBadge(user.role)}
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-3 pr-2">
                                <button className="text-slate-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-1">
                                    Excluir
                                </button>
                                <button className="text-[#009BB6] hover:text-[#007f95] transition-colors text-sm font-bold flex items-center gap-1">
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default UsersView;
