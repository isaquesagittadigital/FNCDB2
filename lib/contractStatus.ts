/**
 * Contract status enum — mirrors the database `contract_status` enum.
 * 
 * Possible values:
 * - Rascunho: Draft, contract not yet signed
 * - Assinado: Signed by the client, awaiting processing
 * - Em processo: Being processed/approved by admin
 * - Vigente: Active and running
 * - Encerrado: Completed/closed
 */
export type ContractStatus = 'Rascunho' | 'Assinado' | 'Em processo' | 'Vigente' | 'Encerrado';

export const CONTRACT_STATUSES: ContractStatus[] = [
    'Rascunho',
    'Assinado',
    'Em processo',
    'Vigente',
    'Encerrado',
];

/**
 * Status display configuration — label, colors, and icon hints for each status.
 */
export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
}> = {
    'Rascunho': {
        label: 'Rascunho',
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
    },
    'Assinado': {
        label: 'Assinado',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-100',
        dotColor: 'bg-blue-500',
    },
    'Em processo': {
        label: 'Em processo',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-100',
        dotColor: 'bg-amber-500',
    },
    'Vigente': {
        label: 'Vigente',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-100',
        dotColor: 'bg-emerald-500',
    },
    'Encerrado': {
        label: 'Encerrado',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-100',
        dotColor: 'bg-red-500',
    },
};

/**
 * Get the display configuration for a given contract status.
 * Falls back to a neutral style for unknown statuses.
 */
export function getStatusConfig(status: string) {
    return CONTRACT_STATUS_CONFIG[status as ContractStatus] || {
        label: status,
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-500',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
    };
}
