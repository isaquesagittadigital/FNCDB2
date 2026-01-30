export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ProcessStep {
    id: string;
    title: string;
    description: string;
    status: ApprovalStatus;
    hasDocument: boolean;
    date?: string;
    rejectionReason?: string;
}

export interface ApprovalProcess {
    id: string;
    clientName: string;
    consultantName: string;
    contractCode: string;
    amount: number;
    documentId: string;
    status: ApprovalStatus;
    steps: ProcessStep[];
}
