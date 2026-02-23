import React, { useState } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { IMaskInput } from 'react-imask';

interface ActivateContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data_ativacao: string, observacao: string) => void;
}

const ActivateContractModal: React.FC<ActivateContractModalProps> = ({ isOpen, onClose, onConfirm }) => {
    // Default to today in DD/MM/YYYY
    const today = new Date();
    const defaultDate = today.toLocaleDateString('pt-BR');

    const [dataDisplay, setDataDisplay] = useState(defaultDate);
    const [observacao, setObservacao] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Convert DD/MM/YYYY to YYYY-MM-DD for backend
        const parts = dataDisplay.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            onConfirm(isoDate, observacao);
        } else {
            // Fallback to today if format is broken
            onConfirm(new Date().toISOString().split('T')[0], observacao);
        }
        setObservacao('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-[#00A3B1]" />
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-6 leading-tight">
                        Ativar contrato
                    </h3>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5 grayscale opacity-70">
                                Data de ativação (DD/MM/AAAA)
                            </label>
                            <div className="relative">
                                <IMaskInput
                                    mask="00/00/0000"
                                    value={dataDisplay}
                                    onAccept={(value: string) => setDataDisplay(value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                                    placeholder="DD/MM/AAAA"
                                />
                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Observação
                            </label>
                            <textarea
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                placeholder="Escreva a observação..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all resize-none"
                            />
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            A partir do momento em que o contrato for ativado, a data de início do contrato será alterada para a data selecionada acima.
                        </p>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-[#00A3B1] hover:bg-[#008c99] text-white font-bold rounded-lg transition-colors shadow-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivateContractModal;
