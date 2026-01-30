
import React, { useState } from 'react';
import ClientsList from './ClientsList';
import ClientForm from './ClientForm';
import { UserPlus } from 'lucide-react';

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[#002B49]">Clientes</h1>
                            <p className="text-slate-500">Gerencie os clientes da plataforma.</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="bg-[#002B49] hover:bg-[#00385D] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm shadow-indigo-900/10"
                        >
                            <UserPlus size={18} />
                            Novo cliente
                        </button>
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
