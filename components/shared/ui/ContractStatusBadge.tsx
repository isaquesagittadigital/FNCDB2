import React from 'react';
import { getStatusConfig } from '../../../lib/contractStatus';

interface ContractStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

/**
 * Unified contract status badge component.
 * Uses the centralized status configuration for consistent styling across the app.
 */
const ContractStatusBadge: React.FC<ContractStatusBadgeProps> = ({ status, size = 'sm' }) => {
    const config = getStatusConfig(status);

    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-3 py-1'
        : 'text-xs px-4 py-1.5';

    return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border whitespace-nowrap ${sizeClasses} ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
};

export default ContractStatusBadge;
