import React, { useState } from 'react';
import { Eye, Check, X, Clock, AlertCircle } from 'lucide-react';
import StepConfirmationModal from './modals/StepConfirmationModal';
import { ProcessStep, ApprovalStatus } from './types';

interface ComplianceCheckRowProps {
    step: ProcessStep;
    onViewDocument: () => void;
    onApprove: () => void;
    onReject: () => void;
}

const ComplianceCheckRow: React.FC<ComplianceCheckRowProps> = ({ step, onViewDocument, onApprove, onReject }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

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
        <div className={`p-5 rounded-xl border ${statusInfo.borderColor} bg-white transition-all shadow-sm hover:shadow-md`}>
            <div className="flex items-start gap-4">
                {/* Status Icon - Fixed size and centered */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor} flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>

                {/* Content area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[#002B49]">{step.title}</h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${statusInfo.borderColor} ${statusInfo.color} font-bold uppercase tracking-wider`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{step.description}</p>

                    {step.hasDocument && (
                        <button
                            onClick={onViewDocument}
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#002B49] transition-colors text-sm font-medium bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#002B49]"
                        >
                            <Eye className="w-4 h-4" />
                            Visualizar documento
                        </button>
                    )}

                    {step.status === 'rejected' && step.rejectionReason && (
                        <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-red-700">Motivo da reprovação:</p>
                                <p className="text-sm text-red-600">{step.rejectionReason}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action button - pinned to the right */}
                {step.status === 'pending' && (
                    <div className="flex-shrink-0 ml-4">
                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="bg-[#009ca6] hover:bg-[#007F87] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                        >
                            <Check className="w-4 h-4" />
                            Aprovar
                        </button>
                    </div>
                )}
            </div>

            <StepConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onApprove={() => {
                    setShowConfirmation(false);
                    onApprove();
                }}
                onReject={() => {
                    setShowConfirmation(false);
                    onReject();
                }}
            />
        </div>
    );
};

export default ComplianceCheckRow;
