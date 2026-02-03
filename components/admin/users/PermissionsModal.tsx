
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { Toggle } from '../../shared/ui/FormElements';
import SuccessModal from '../../shared/ui/SuccessModal';
import ErrorModal from '../../shared/ui/ErrorModal';

interface PermissionEntry {
    modulo: string;
    pode_visualizar: boolean;
    pode_cadastrar: boolean;
    pode_editar: boolean;
    pode_excluir: boolean;
}

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    user: {
        id: string;
        nome_fantasia?: string;
        email: string;
        tipo_perfil_usuario?: string;
    } | null;
}

const MODULES = [
    { id: 'consultores', label: 'Consultores', desc: 'consultores' },
    { id: 'aprovacao', label: 'Aprovação', desc: 'consultores' }, // as per image 2
    { id: 'contratos', label: 'Contratos', desc: 'contratos' },
    { id: 'clientes', label: 'Clientes', desc: 'clientes' },
    { id: 'nota_fiscal', label: 'Nota fiscal', desc: 'nota fiscal' },
    { id: 'informe_rendimentos', label: 'Informe de rendimentos', desc: 'informe de rendimentos' },
    { id: 'calendario', label: 'Calendário', desc: 'informe de rendimentos' }, // as per image 1 mismatch but siguiendo labels
    { id: 'gerenciar_pagamentos', label: 'Gerenciar pagamentos', desc: 'gerenciar pagamentos' },
    { id: 'usuarios', label: 'Usuários', desc: 'usuários' },
];

const TABS = [
    { id: 'editar', label: 'Edição', key: 'pode_editar' },
    { id: 'visualizar', label: 'Visualização', key: 'pode_visualizar' },
    { id: 'cadastrar', label: 'Cadastro', key: 'pode_cadastrar' },
    { id: 'excluir', label: 'Exclusão', key: 'pode_excluir' },
] as const;

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, onUpdate, user }) => {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('editar');
    const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
    const [accessLevel, setAccessLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setAccessLevel(user.tipo_perfil_usuario || 'Lider');
            fetchPermissions();
        }
    }, [isOpen, user]);

    const fetchPermissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/admin/users/${user.id}/permissions`);
            const data = await response.json();

            // Map existing or default permissions
            const initialPermissions = MODULES.map(mod => {
                const existing = data.find((p: any) => p.modulo === mod.id);
                return existing || {
                    modulo: mod.id,
                    pode_visualizar: false,
                    pode_cadastrar: false,
                    pode_editar: false,
                    pode_excluir: false,
                };
            });
            setPermissions(initialPermissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (moduleId: string, tabKey: keyof PermissionEntry) => {
        setPermissions(prev => prev.map(p => {
            if (p.modulo === moduleId) {
                return { ...p, [tabKey]: !p[tabKey] };
            }
            return p;
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const url = `${(import.meta as any).env.VITE_API_URL}/admin/users/${user.id}/permissions`;
            console.log('Saving permissions to:', url, { permissions, tipo_perfil_usuario: accessLevel });

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    permissions,
                    tipo_perfil_usuario: accessLevel
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save');
            }

            if (onUpdate) onUpdate();
            setIsSuccessModalOpen(true);
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSuccessClose = () => {
        setIsSuccessModalOpen(false);
        onClose();
    };

    if (!isOpen || !user) return null;

    const currentTabKey = TABS.find(t => t.id === activeTab)?.key as keyof PermissionEntry;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#002B49]">{user.nome_fantasia || 'Usuário'}</h3>
                                <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#002B49]">Nível de Acesso</label>
                            <select
                                value={accessLevel}
                                onChange={(e) => setAccessLevel(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none text-sm font-medium"
                            >
                                <option value="Lider">Lider</option>
                                <option value="Consultor">Consultor</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                                <option value="Operador">Operador</option>
                            </select>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {MODULES.map(mod => {
                                const perm = permissions.find(p => p.modulo === mod.id);
                                return (
                                    <Toggle
                                        key={mod.id}
                                        label={mod.label}
                                        description={`Habilitar a ${activeTab === 'visualizar' ? 'visualizar' : (activeTab === 'editar' ? 'edição' : (activeTab === 'cadastrar' ? 'cadastro' : 'exclusão'))} de ${mod.desc}`}
                                        checked={perm ? !!(perm as any)[currentTabKey] : false}
                                        onChange={() => handleToggle(mod.id, currentTabKey)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-[#009BB6] text-white font-bold rounded-xl hover:bg-[#008f9e] transition-all shadow-lg shadow-[#009BB6]/20 active:scale-95 disabled:opacity-70"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </motion.div>
            </div>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessClose}
                title="Sucesso!"
                message="Permissões e nível de acesso atualizados com sucesso para este usuário."
            />

            {errorMsg && (
                <ErrorModal
                    isOpen={!!errorMsg}
                    onClose={() => setErrorMsg(null)}
                    title="Erro ao salvar"
                    message={errorMsg}
                />
            )}
        </AnimatePresence>
    );
};

export default PermissionsModal;
