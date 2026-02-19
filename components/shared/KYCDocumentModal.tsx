
import React from 'react';
import { X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KYCDocumentContent from './KYCDocumentContent';

interface KYCDocumentModalProps {
    data: any;
    onClose: () => void;
}

const KYCDocumentModal: React.FC<KYCDocumentModalProps> = ({ data, onClose }) => {

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="kyc-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-[#002B49]/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[301] flex items-start justify-center pt-2 pb-4 px-4 overflow-y-auto pointer-events-none">
                <motion.div
                    key="kyc-modal"
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                    className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative mt-2 mb-8 pointer-events-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <FileText className="text-white" size={18} />
                            </div>
                            <h2 className="text-base font-bold text-[#002B49] leading-tight">Formulário do Investidor (KYC)</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X size={16} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-80px)]">
                        <KYCDocumentContent data={data} />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default KYCDocumentModal;
