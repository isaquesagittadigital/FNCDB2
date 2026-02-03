
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { Field } from '../../shared/ui/FormElements';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome_fantasia: '',
        email: '',
        tipo_user: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm(formData);
            onClose();
            setFormData({ nome_fantasia: '', email: '', tipo_user: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-[#E6F6F7] text-[#00A3B1] rounded-full flex items-center justify-center mb-4 border border-[#00A3B1]/20">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#002B49]">Cadastrar usuários</h3>
                        </div>

                        <div className="space-y-4">
                            <Field
                                label="Nome completo"
                                value={formData.nome_fantasia}
                                onChange={(val) => setFormData({ ...formData, nome_fantasia: val })}
                                placeholder="Informe o nome completo"
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
                                <label className="text-sm font-bold text-[#002B49]">Nível de Acesso<span className="text-[#00A3B1]">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.tipo_user}
                                        onChange={(e) => setFormData({ ...formData, tipo_user: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="Admin">Administrador (Super Admin, Líder)</option>
                                        <option value="Consultor">Consultor (Operador)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#009BB6] hover:bg-[#008f9e] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#009BB6]/20 active:scale-95 disabled:opacity-70 flex items-center justify-center"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Criar administrador'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateUserModal;
