
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, CreditCard, FileText } from 'lucide-react';
import ClientGeneralForm from './tabs/ClientGeneralForm';
import ClientAddressForm from './tabs/ClientAddressForm';
import ClientBankForm from './tabs/ClientBankForm';
import ClientContractsTab from './tabs/ClientContractsTab';

interface ClientFormProps {
    clientId: string | null;
    onBack: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ clientId, onBack }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [clientData, setClientData] = useState<any>(null);
    const [currentClientId, setCurrentClientId] = useState<string | null>(clientId);

    useEffect(() => {
        if (clientId) {
            fetchClientData(clientId);
        }
    }, [clientId]);

    const fetchClientData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClientData(data);
            }
        } catch (error) {
            console.error("Failed to fetch client", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async (data: any) => {
        setLoading(true);
        try {
            const url = currentClientId
                ? `${import.meta.env.VITE_API_URL}/admin/clients/${currentClientId}`
                : `${import.meta.env.VITE_API_URL}/admin/clients`;

            const method = currentClientId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const savedClient = await res.json();
                if (!currentClientId) {
                    setCurrentClientId(savedClient.id);
                    // Move to address tab
                    setActiveTab('address');
                } else {
                    // Update local data
                    setClientData({ ...clientData, ...savedClient });
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
        if (!currentClientId) return;
        await handleSaveGeneral(data); // Re-use update logic since address is on the user table
        // Move to next tab (optional)
        setActiveTab('bank');
    };

    const tabs = [
        { id: 'general', label: 'Dados gerais', icon: User },
        { id: 'address', label: 'Endereço', icon: MapPin },
        { id: 'bank', label: 'Dados bancários', icon: CreditCard },
        { id: 'contracts', label: 'Contratos', icon: FileText },
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
                            <span>Clientes</span>
                            <span>›</span>
                            <span>{currentClientId ? 'Editar cliente' : 'Cadastrar cliente'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#002B49]">
                            {currentClientId ? 'Editar cliente' : 'Cadastrar cliente'}
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-100">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDisabled = !currentClientId && tab.id !== 'general';

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
                    <ClientGeneralForm
                        initialData={clientData}
                        onSubmit={handleSaveGeneral}
                        loading={loading}
                    />
                )}
                {activeTab === 'address' && (
                    <ClientAddressForm
                        initialData={clientData}
                        onSubmit={handleSaveAddress}
                        loading={loading}
                    />
                )}
                {activeTab === 'bank' && (
                    <ClientBankForm
                        clientId={currentClientId || undefined}
                    />
                )}
                {activeTab === 'contracts' && (
                    <ClientContractsTab
                        clientId={currentClientId || undefined}
                    />
                )}
            </div>
        </div>
    );
};

export default ClientForm;
