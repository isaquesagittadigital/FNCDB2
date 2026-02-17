import React, { useState } from 'react';
import { X, FileText, Calendar } from 'lucide-react';

interface ActivateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data_ativacao: string, observacao: string) => void;
}

const ActivateContractModal: React.FC<ActivateContractModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [dataAtivacao, setDataAtivacao] = useState(new Date().toISOString().split('T')[0]);
    const [observacao, setObservacao] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(dataAtivacao, observacao);
        setObservacao('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-5 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#009ca6]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Ativar contrato</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 space-y-4">
                    {/* Data de ativação */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Data de ativação
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dataAtivacao}
                                onChange={(e) => setDataAtivacao(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#009ca6] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Observação */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Observação
                        </label>
                        <textarea
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            placeholder="Escreva a observação..."
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#009ca6] focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Note */}
                    <p className="text-xs text-slate-400 leading-relaxed">
                        A partir do momento em que o contrato for ativado, a data de início do contrato será alterada para a data selecionada acima.
                    </p>

                    {/* Confirm button */}
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-[#009ca6] hover:bg-[#007F87] text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivateContractModal;
