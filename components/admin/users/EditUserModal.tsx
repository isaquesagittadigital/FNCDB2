
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Loader2 } from 'lucide-react';
import { Field } from '../../shared/ui/FormElements';
import SuccessModal from '../../shared/ui/SuccessModal';
import ErrorModal from '../../shared/ui/ErrorModal';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    user: {
        id: string;
        nome_fantasia?: string;
        razao_social?: string;
        nome?: string;
        email: string;
        tipo_user: string;
        tipo_perfil_usuario?: string;
        os_cargo_user?: string;
    } | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUpdate, user }) => {
    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        tipo_perfil_usuario: '',
        tipo_user: '',
        os_cargo_user: ''
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                nome: user.nome_fantasia || user.razao_social || user.nome || '',
                email: user.email || '',
                tipo_perfil_usuario: user.tipo_perfil_usuario || '',
                tipo_user: user.tipo_user || '',
                os_cargo_user: user.os_cargo_user || ''
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setErrorMsg(null);

        try {
            const url = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api'}/admin/users/${user.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome_fantasia: formData.nome,
                    email: formData.email,
                    tipo_perfil_usuario: formData.tipo_perfil_usuario,
                    tipo_user: formData.tipo_user,
                    os_cargo_user: formData.os_cargo_user
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro ao atualizar dados do usuário');
            }

            setIsSuccessModalOpen(true);
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error updating user:', error);
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setIsSuccessModalOpen(false);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-[#F1F5F9] text-[#475569] rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                <User size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#002B49]">Editar Usuário</h3>
                            <p className="text-sm text-slate-500 mt-1">Atualize as informações básicas do perfil</p>
                        </div>

                        <div className="space-y-5">
                            <Field
                                label="Nome completo / Empresa"
                                value={formData.nome}
                                onChange={(val) => setFormData({ ...formData, nome: val })}
                                placeholder="Informe o nome"
                                required
                            />

                            <Field
                                label="Email"
                                value={formData.email}
                                onChange={(val) => setFormData({ ...formData, email: val })}
                                placeholder="Informe o email"
                                type="email"
                                required
                            />

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#002B49]">Nível de Acesso (Perfil)</label>
                                <select
                                    value={formData.tipo_perfil_usuario}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Auto-map tipo_user based on selection for consistency
                                        let tUser = formData.tipo_user;
                                        if (['Admin', 'Super Admin', 'Lider'].includes(val)) tUser = 'Admin';
                                        else if (['Consultor', 'Operador'].includes(val)) tUser = 'Consultor';

                                        setFormData({
                                            ...formData,
                                            tipo_perfil_usuario: val,
                                            tipo_user: tUser
                                        });
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] appearance-none text-sm font-medium"
                                    required
                                >
                                    <option value="" disabled>Selecione o nível</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Lider">Lider</option>
                                    <option value="Operador">Operador</option>
                                    <option value="Consultor">Consultor</option>
                                    <option value="Cliente">Cliente</option>
                                </select>
                            </div>

                            <AnimatePresence>
                                {formData.tipo_user === 'Admin' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 mt-4"
                                    >
                                        <label className="text-sm font-bold text-[#002B49]">Cargo (Permissões de Visibilidade - os_cargo_user)<span className="text-[#00A3B1]">*</span></label>
                                        <div className="relative">
                                            <select
                                                value={formData.os_cargo_user || 'Admin'}
                                                onChange={(e) => setFormData({ ...formData, os_cargo_user: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#009BB6]/20 focus:border-[#009BB6] appearance-none"
                                                required
                                            >
                                                <option value="Admin">Admin</option>
                                                <option value="Operador">Operador</option>
                                                <option value="Super ADMIN">Super ADMIN</option>
                                                <option value="Lider">Líder</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-3 mt-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3.5 bg-[#009BB6] text-white font-bold rounded-xl hover:bg-[#008f9e] transition-all shadow-lg shadow-[#009BB6]/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessClose}
                title="Dados atualizados!"
                message="As informações do usuário foram atualizadas com sucesso."
            />

            {errorMsg && (
                <ErrorModal
                    isOpen={!!errorMsg}
                    onClose={() => setErrorMsg(null)}
                    title="Erro ao atualizar"
                    message={errorMsg}
                />
            )}
        </AnimatePresence>
    );
};

export default EditUserModal;
