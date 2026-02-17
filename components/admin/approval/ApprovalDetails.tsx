import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, User, Eye } from 'lucide-react';
import { ApprovalProcess, ProcessStep } from './types';
import ComplianceCheckRow from './ComplianceCheckRow';
import DocumentViewerModal from './modals/DocumentViewerModal';
import RejectionModal from './modals/RejectionModal';
import ConfirmationModal from './modals/ConfirmationModal';
import InvestorProfileModal from './modals/InvestorProfileModal';
import ActivateContractModal from './modals/ActivateContractModal';

interface ApprovalDetailsProps {
    process: ApprovalProcess;
    onBack: () => void;
    onUpdateStepStatus: (stepId: string, status: 'approved' | 'rejected', reason?: string) => void;
    onFinalizeProcess: (approved: boolean, data_ativacao?: string, observacao?: string) => void;
}

const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({ process, onBack, onUpdateStepStatus, onFinalizeProcess }) => {
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
    const [stepToReject, setStepToReject] = useState<string | null>(null);
    const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
    const [showFinalRejection, setShowFinalRejection] = useState(false);
    const [showInvestorProfile, setShowInvestorProfile] = useState(false);
    const [showActivateModal, setShowActivateModal] = useState(false);

    const handleViewDocument = (step: ProcessStep) => {
        // For "Perfil do investidor" step, open the investor profile modal
        if (step.id.endsWith('-perfil')) {
            setShowInvestorProfile(true);
        } else {
            setSelectedDocument(step.title);
        }
    };

    const handleApproveStep = (stepId: string) => {
        onUpdateStepStatus(stepId, 'approved');
    };

    const handleRejectStep = (stepId: string) => {
        setStepToReject(stepId);
    };

    const confirmRejectStep = (reason: string) => {
        if (stepToReject) {
            onUpdateStepStatus(stepToReject, 'rejected', reason);
            setStepToReject(null);
        }
    };

    const allStepsApproved = process.steps.every(s => s.status === 'approved');

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-[#002B49] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para lista
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#002B49]">{process.clientName}</h1>
                    <p className="text-slate-500">Revisão e aprovação do processo de Integralização</p>
                </div>
                {process.clientId && (
                    <button
                        onClick={() => setShowInvestorProfile(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        <User className="w-4 h-4" />
                        Ver perfil do investidor
                    </button>
                )}
            </div>

            {/* Contract Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-4 gap-4">
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Código</p>
                    <p className="text-sm font-semibold text-slate-800">{process.contractCode}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Valor</p>
                    <p className="text-sm font-semibold text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.amount)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Consultor</p>
                    <p className="text-sm font-semibold text-slate-800">{process.consultantName}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Documento</p>
                    <p className="text-sm font-semibold text-slate-800">{process.documentId}</p>
                </div>
            </div>

            <div className="space-y-4">
                {process.steps.map(step => (
                    <ComplianceCheckRow
                        key={step.id}
                        step={step}
                        onViewDocument={() => handleViewDocument(step)}
                        onApprove={() => handleApproveStep(step.id)}
                        onReject={() => handleRejectStep(step.id)}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Aprovação final</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowFinalRejection(true)}
                        className="px-6 py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <XCircle className="w-5 h-5" />
                        Reprovar
                    </button>
                    <button
                        onClick={() => setShowActivateModal(true)}
                        disabled={!allStepsApproved}
                        className={`px-6 py-2.5 bg-[#009ca6] hover:bg-[#007F87] text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm ${!allStepsApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        Aprovar processo
                    </button>
                </div>
            </div>

            <DocumentViewerModal
                isOpen={!!selectedDocument}
                onClose={() => setSelectedDocument(null)}
                documentTitle={selectedDocument || ''}
            />

            <RejectionModal
                isOpen={!!stepToReject}
                onClose={() => setStepToReject(null)}
                onConfirm={confirmRejectStep}
                title="Reprovar Etapa"
            />

            <RejectionModal
                isOpen={showFinalRejection}
                onClose={() => setShowFinalRejection(false)}
                onConfirm={(reason) => {
                    onFinalizeProcess(false, undefined, reason);
                    setShowFinalRejection(false);
                }}
                title="Reprovar Processo"
            />

            <ConfirmationModal
                isOpen={showFinalConfirmation}
                onClose={() => setShowFinalConfirmation(false)}
                onConfirm={() => {
                    onFinalizeProcess(true);
                    setShowFinalConfirmation(false);
                }}
            />

            {process.clientId && (
                <InvestorProfileModal
                    isOpen={showInvestorProfile}
                    onClose={() => setShowInvestorProfile(false)}
                    clientId={process.clientId}
                />
            )}

            <ActivateContractModal
                isOpen={showActivateModal}
                onClose={() => setShowActivateModal(false)}
                onConfirm={(data_ativacao, observacao) => {
                    onFinalizeProcess(true, data_ativacao, observacao);
                    setShowActivateModal(false);
                }}
            />
        </div>
    );
};

export default ApprovalDetails;
