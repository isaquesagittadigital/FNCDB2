import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ApprovalProcess, ProcessStep } from './types';
import ComplianceCheckRow from './ComplianceCheckRow';
import DocumentViewerModal from './modals/DocumentViewerModal';
import RejectionModal from './modals/RejectionModal';
import ConfirmationModal from './modals/ConfirmationModal';

interface ApprovalDetailsProps {
    process: ApprovalProcess;
    onBack: () => void;
    onUpdateStepStatus: (stepId: string, status: 'approved' | 'rejected', reason?: string) => void;
    onFinalizeProcess: (approved: boolean) => void;
}

const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({ process, onBack, onUpdateStepStatus, onFinalizeProcess }) => {
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
    const [stepToReject, setStepToReject] = useState<string | null>(null);
    const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
    const [showFinalRejection, setShowFinalRejection] = useState(false);

    const handleViewDocument = (step: ProcessStep) => {
        setSelectedDocument(step.title); // Simulating document by title
    };

    const handleApproveStep = (stepId: string) => {
        onUpdateStepStatus(stepId, 'approved');
    };

    const handleRejectStep = (stepId: string) => {
        setStepToReject(stepId);
    };

    const confirmRejectStep = (reason: string, date: string) => { // Date not used in simple status update but could be logged
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

            <div>
                <h1 className="text-2xl font-bold text-[#002B49]">{process.clientName}</h1>
                <p className="text-slate-500">Revisão e aprovação do processo de Integralização</p>
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
                        onClick={() => setShowFinalConfirmation(true)}
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
                    // Logic for final rejection
                    onFinalizeProcess(false);
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
        </div>
    );
};

export default ApprovalDetails;
