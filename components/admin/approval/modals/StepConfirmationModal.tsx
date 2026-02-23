import React from 'react';
import { X, FileText } from 'lucide-react';

interface StepConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
}

const StepConfirmationModal: React.FC<StepConfirmationModalProps> = ({ isOpen, onClose, onApprove, onReject }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-[#00A3B1]" />
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                        Confirma a aprovação deste processo?
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Certifique-se de que este processo atende a todos os requisitos necessários para a realização da aprovação.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onApprove}
                            className="w-full py-3 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                            Sim, aprovar
                        </button>
                        <button
                            onClick={onReject}
                            className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                            Não, reprovar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepConfirmationModal;
