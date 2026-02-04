
import React, { useState } from 'react';
import ClientsList from './ClientsList';
import ClientForm from './ClientForm';
import { UserPlus, Home, ChevronRight } from 'lucide-react';

const ClientsView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedClientId(null);
        setViewMode('create');
    };

    const handleEdit = (id: string) => {
        setSelectedClientId(id);
        setViewMode('edit');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedClientId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {viewMode === 'list' && (
                <>
                    {/* Header with Breadcrumb and Action */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-base font-medium text-slate-500">
                            <Home size={18} className="text-slate-400" />
                            <ChevronRight size={18} className="text-slate-300" />
                            <span className="text-[#002B49] font-semibold">Clientes</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-[#002B49]">Clientes</h1>

                            <button
                                onClick={handleCreate}
                                className="bg-[#00A3B1] hover:bg-[#008c99] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-sm shadow-cyan-900/10"
                            >
                                <UserPlus size={18} />
                                Cadastrar novo cliente
                            </button>
                        </div>
                    </div>

                    <ClientsList onEdit={handleEdit} />
                </>
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <ClientForm
                    clientId={selectedClientId}
                    onBack={handleBack}
                />
            )}
        </div>
    );
};

export default ClientsView;
