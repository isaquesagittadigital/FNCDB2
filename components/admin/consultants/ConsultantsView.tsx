
import React, { useState } from 'react';
import { UserPlus, Home, ChevronRight, ChevronLeft } from 'lucide-react';
import ConsultantsList from './ConsultantsList';
import ConsultantForm from './ConsultantForm';

type ViewMode = 'list' | 'create' | 'edit';

const ConsultantsView: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedId(null);
        setViewMode('create');
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        setViewMode('edit');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                {/* Breadcrumbs & Action Button Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Home size={16} className="text-slate-400" />
                        <ChevronRight size={16} className="text-slate-300" />
                        <span className="text-slate-600">Consultores</span>
                    </div>

                    {viewMode === 'list' && (
                        <button
                            onClick={handleCreate}
                            className="bg-[#00A3B1] hover:bg-[#008c99] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-bold shadow-sm shadow-cyan-900/10 active:scale-95"
                        >
                            <UserPlus size={18} />
                            Cadastrar novo consultor
                        </button>
                    )}
                </div>

                {/* Page Title Row */}
                <h1 className="text-2xl font-bold text-[#002B49]">
                    {viewMode === 'list' && 'Consultores'}
                    {viewMode === 'create' && 'Novo Consultor'}
                    {viewMode === 'edit' && 'Editar Consultor'}
                </h1>
            </div>

            {/* Main Content Areas */}
            <div className="animate-in fade-in duration-500">
                {viewMode === 'list' && (
                    <ConsultantsList onEdit={handleEdit} />
                )}

                {(viewMode === 'create' || viewMode === 'edit') && (
                    <div>
                        <ConsultantForm
                            currentId={selectedId || undefined}
                            onSuccess={handleBack}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultantsView;
