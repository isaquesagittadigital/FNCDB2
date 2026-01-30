import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center">
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pb-6 pt-0">
                    <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-[#009ca6]" />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirma a aprovação deste processo?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Certifique-se de que este processo atende a todos os requisitos necessários para a realização da aprovação.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 bg-[#009ca6] hover:bg-[#007F87] text-white font-medium rounded-lg transition-colors"
                        >
                            Sim, aprovar
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Não, reprovar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
