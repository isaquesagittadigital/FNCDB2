
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, CreditCard, FileText } from 'lucide-react';
import ConsultantGeneralForm from './tabs/ConsultantGeneralForm';
import ClientAddressForm from '../clients/tabs/ClientAddressForm';
import ClientBankForm from '../clients/tabs/ClientBankForm';

interface ConsultantFormProps {
    consultantId: string | null;
    onBack: () => void;
}

const ConsultantForm: React.FC<ConsultantFormProps> = ({ consultantId, onBack }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [consultantData, setConsultantData] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string | null>(consultantId);

    useEffect(() => {
        if (consultantId) {
            fetchConsultantData(consultantId);
        }
    }, [consultantId]);

    const fetchConsultantData = async (id: string) => {
        setLoading(true);
        try {
            // Reusing clients endpoint if structure is same or creating new GET /consultants/:id?
            // Wait, we defined GET /consultants but not GET /consultants/:id in admin.routes.ts...
            // Actually, ClientForm uses GET /clients/:id. 
            // In admin.routes.ts, GET /clients/:id fetches from 'usuarios' table by ID.
            // Since consultants are also in 'usuarios' table, we can REUSE GET /clients/:id !
            // It just fetches by ID.
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${id}`);
            if (res.ok) {
                const data = await res.json();
                setConsultantData(data);
            }
        } catch (error) {
            console.error("Failed to fetch consultant", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async (data: any) => {
        setLoading(true);
        try {
            const url = currentId
                ? `${import.meta.env.VITE_API_URL}/admin/consultants/${currentId}`
                : `${import.meta.env.VITE_API_URL}/admin/consultants`;

            const method = currentId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const saved = await res.json();
                if (!currentId) {
                    setCurrentId(saved.id);
                    setActiveTab('address');
                } else {
                    setConsultantData({ ...consultantData, ...saved });
                }
                alert('Dados salvos com sucesso!');
            } else {
                const err = await res.json();
                alert(`Erro ao salvar: ${err.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (data: any) => {
        if (!currentId) return;
        // Address save logic - reusing client/user update since address fields are on user table
        // We can use the specific consultant PUT endpoint or the general client one.
        // Let's use the consultant PUT endpoint we created.

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/consultants/${currentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const saved = await res.json();
                setConsultantData({ ...consultantData, ...saved });
                alert('Endereço salvo com sucesso!');
                setActiveTab('bank');
            } else {
                alert('Erro ao salvar endereço');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'Dados gerais', icon: User },
        { id: 'address', label: 'Endereço', icon: MapPin },
        { id: 'bank', label: 'Dados bancários', icon: CreditCard },
        // Contracts tab might differ for consultants (their own contract with us), but keeping it simple for now.
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#002B49] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                            <span>Consultores</span>
                            <span>›</span>
                            <span>{currentId ? 'Editar consultor' : 'Cadastrar consultor'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#002B49]">
                            {currentId ? 'Editar consultor' : 'Cadastrar consultor'}
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-100">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDisabled = !currentId && tab.id !== 'general';

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && setActiveTab(tab.id)}
                                disabled={isDisabled}
                                className={`
                                    flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors relative
                                    ${isActive
                                        ? 'border-[#002B49] text-[#002B49]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }
                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 bg-[#FDFDFD]">
                {activeTab === 'general' && (
                    <ConsultantGeneralForm
                        initialData={consultantData}
                        onSubmit={handleSaveGeneral}
                        loading={loading}
                    />
                )}
                {activeTab === 'address' && (
                    <ClientAddressForm
                        initialData={consultantData}
                        onSubmit={handleSaveAddress}
                        loading={loading}
                    />
                )}
                {activeTab === 'bank' && (
                    <ClientBankForm
                        clientId={currentId || undefined}
                    />
                )}
            </div>
        </div>
    );
};

export default ConsultantForm;
