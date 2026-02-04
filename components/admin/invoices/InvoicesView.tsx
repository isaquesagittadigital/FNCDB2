import React, { useState } from 'react';
import { Home, ChevronRight, Search } from 'lucide-react';
import InvoicesList from './InvoicesList';

const InvoicesView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section with Breadcrumbs */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Home size={16} className="text-slate-400" />
                    <ChevronRight size={16} className="text-slate-300" />
                    <span className="text-slate-600">Nota fiscal</span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#002B49]">
                        Nota fiscal de comissão
                    </h1>
                </div>
            </div>

            {/* Content area */}
            {viewMode === 'list' && (
                <InvoicesList />
            )}
        </div>
    );
};

export default InvoicesView;
