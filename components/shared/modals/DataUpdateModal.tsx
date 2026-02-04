
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X } from 'lucide-react';

interface DataUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DataUpdateModal: React.FC<DataUpdateModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleSendEmail = () => {
        window.location.href = "mailto:suporte@fncd.com.br?subject=Solicitação de Alteração de Dados";
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[#D9F4F6] text-[#00A3B1] rounded-full flex items-center justify-center mb-8">
                            <Mail size={36} />
                        </div>

                        <h3 className="text-xl font-bold text-[#002B49] mb-6">Alterações de dados</h3>

                        <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">
                            Para alterar os dados, envie um email solicitando a alteração, por exemplo:
                            <span className="italic"> "Gostaria de alterar o meu nome de Carlos Araújo para Carlos Silva".</span>
                        </p>

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleSendEmail}
                                className="w-full bg-[#00A3B1] hover:bg-[#008c99] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all"
                            >
                                Enviar email
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full bg-white border border-slate-200 text-slate-500 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DataUpdateModal;
