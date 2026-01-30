import React from 'react';
import { Eye, Check, X, Clock, AlertCircle } from 'lucide-react';
import { ProcessStep, ApprovalStatus } from './types';

interface ComplianceCheckRowProps {
    step: ProcessStep;
    onViewDocument: () => void;
    onApprove: () => void;
    onReject: () => void;
}

const ComplianceCheckRow: React.FC<ComplianceCheckRowProps> = ({ step, onViewDocument, onApprove, onReject }) => {
    const getStatusInfo = (status: ApprovalStatus) => {
        switch (status) {
            case 'approved':
                return {
                    icon: Check,
                    color: 'text-emerald-500',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-100',
                    label: 'Aprovado'
                };
            case 'rejected':
                return {
                    icon: X,
                    color: 'text-red-500',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-100',
                    label: 'Reprovado'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-amber-500',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-100',
                    label: 'Pendente'
                };
        }
    };

    const statusInfo = getStatusInfo(step.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className={`p-6 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all`}>
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className={`p-2 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-slate-800">{step.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.borderColor} ${statusInfo.color} font-medium bg-white`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{step.description}</p>

                        {step.hasDocument && (
                            <button
                                onClick={onViewDocument}
                                className="flex items-center gap-2 text-slate-600 hover:text-[#002B49] transition-colors text-sm font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#002B49]"
                            >
                                <Eye className="w-4 h-4" />
                                Visualizar documento
                            </button>
                        )}

                        {step.status === 'rejected' && step.rejectionReason && (
                            <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-red-700">Motivo da reprovação:</p>
                                    <p className="text-sm text-red-600">{step.rejectionReason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {step.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onApprove}
                            className="bg-[#009ca6] hover:bg-[#007F87] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            Aprovar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplianceCheckRow;
