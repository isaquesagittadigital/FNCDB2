
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import SuccessModal from '../../shared/ui/SuccessModal';
import ErrorModal from '../../shared/ui/ErrorModal';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    user: {
        id: string;
        nome_fantasia?: string;
        nome?: string;
        email: string;
    } | null;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, onUpdate, user }) => {
    const [loading, setLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!user) return;

        setLoading(true);
        setErrorMsg(null);

        try {
            const url = `${(import.meta as any).env.VITE_API_URL}/admin/users/${user.id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro ao inativar usuário');
            }

            setIsSuccessModalOpen(true);
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error deleting user:', error);
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
                    className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto ring-8 ring-red-50/50">
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-[#002B49] mb-3">Inativar Usuário</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Você tem certeza que deseja inativar <strong>{user.nome_fantasia || user.nome}</strong>?
                            O usuário perderá o acesso ao sistema imediatamente.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Inativação'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-3.5 rounded-xl font-bold transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessClose}
                title="Usuário Inativado!"
                message="O acesso do usuário foi bloqueado e ele não poderá mais logar no sistema."
            />

            {errorMsg && (
                <ErrorModal
                    isOpen={!!errorMsg}
                    onClose={() => setErrorMsg(null)}
                    title="Erro ao inativar"
                    message={errorMsg}
                />
            )}
        </AnimatePresence>
    );
};

export default DeleteUserModal;
