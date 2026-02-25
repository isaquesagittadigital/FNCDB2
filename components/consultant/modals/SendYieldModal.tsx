import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SendYieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
}

const SendYieldModal: React.FC<SendYieldModalProps> = ({ isOpen, onClose, clients }) => {
    const [selectedClient, setSelectedClient] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSend = () => {
        if (!selectedClient) return;
        // Simulate sending
        setIsSuccess(true);
    };

    const handleClose = () => {
        setIsSuccess(false);
        setSelectedClient('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-[#002B49]/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden flex flex-col p-8"
                    >
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 bg-[#E6F6F7] rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle2 size={32} className="text-[#00A3B1]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#002B49]">Documentos enviados</h3>
                                <p className="text-slate-500 font-medium">Os documentos foram enviados com sucesso.</p>
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-6 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold py-3.5 rounded-xl transition-all"
                                >
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-[#E6F6F7] rounded-full flex items-center justify-center">
                                        <FileText size={24} className="text-[#00A3B1]" />
                                    </div>
                                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-[#002B49] mb-1">Enviar documentos</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#002B49]">Clientes <span className="text-[#00A3B1]">*</span></label>
                                    <select
                                        value={selectedClient}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#002B49] focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:border-[#00A3B1] transition-all appearance-none"
                                    >
                                        <option value="" disabled>Selecionar cliente</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.nome_fantasia || client.razao_social || client.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handleSend}
                                        disabled={!selectedClient}
                                        className="w-full bg-[#00A3B1] hover:bg-[#008c99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all"
                                    >
                                        Enviar documentos
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-[#002B49] font-bold py-3.5 rounded-xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SendYieldModal;
