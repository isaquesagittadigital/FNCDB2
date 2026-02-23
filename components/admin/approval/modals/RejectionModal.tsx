import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, date: string) => void;
    title: string;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

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
                        {title}
                    </h3>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Data de reprovação</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Motivo da reprovação</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Escreva a observação..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/30 focus:border-[#00A3B1] transition-all resize-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (reason) onConfirm(reason, date);
                        }}
                        className="w-full py-3 bg-[#A3E5E6] hover:bg-[#009ca6] text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={!reason}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;
