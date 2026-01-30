import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, documentTitle }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="font-semibold text-slate-800">{documentTitle}</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex items-center justify-center">
                        <div className="bg-white shadow-lg p-12 min-h-[600px] w-full max-w-3xl flex flex-col items-center justify-center text-slate-300 border border-slate-200">
                            <p className="mt-4 font-medium">Visualização do documento simulada</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DocumentViewerModal;
