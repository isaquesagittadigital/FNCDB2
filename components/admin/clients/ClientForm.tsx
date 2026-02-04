import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, CreditCard, FileText, Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ClientGeneralForm from './tabs/ClientGeneralForm';
import ClientAddressForm from './tabs/ClientAddressForm';
import ClientBankForm from './tabs/ClientBankForm';
import ClientContractsTab from './tabs/ClientContractsTab';
import SuccessModal from '../../shared/modals/SuccessModal';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ContractPDF from './ContractPDFTemplate';

interface ClientFormProps {
    clientId: string | null;
    onBack: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ clientId, onBack }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [clientData, setClientData] = useState<any>(null);
    const [currentClientId, setCurrentClientId] = useState<string | null>(clientId);
    const [showSuccess, setShowSuccess] = useState(false);

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
                setShowSuccess(true);
            } else {
                const err = await res.json();
                let errorMessage = err.error || 'Erro desconhecido';
                if (errorMessage.includes('User already registered')) {
                    errorMessage = 'Este e-mail já está cadastrado no sistema.';
                }
                alert(`Erro ao salvar: ${errorMessage}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!currentClientId || !window.confirm(`Tem certeza que deseja alterar o status para ${newStatus}?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${currentClientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_cliente: newStatus })
            });

            if (res.ok) {
                // Refresh data
                fetchClientData(currentClientId);
                alert(`Status alterado para ${newStatus}`);
            } else {
                alert('Erro ao alterar status');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao alterar status');
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header (Outside Card) */}
            <div className="flex flex-col gap-4">
                <div className="text-base font-medium text-slate-500 flex items-center gap-2">
                    <button onClick={onBack} className="hover:text-[#002B49] transition-colors flex items-center gap-2">
                        <Home size={18} className="text-slate-400" />
                    </button>
                    <ChevronRight size={18} className="text-slate-300" />
                    <button onClick={onBack} className="hover:text-[#002B49] hover:underline transition-colors cursor-pointer">
                        Clientes
                    </button>
                    <ChevronRight size={18} className="text-slate-300" />
                    <span className="text-[#002B49] font-semibold">{currentClientId ? 'Editar cliente' : 'Cadastrar cliente'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-[#002B49]">
                            {currentClientId ? 'Editar cliente' : 'Cadastrar cliente'}
                        </h1>
                        {clientData?.status_cliente && (
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${clientData.status_cliente === 'Ativo' || clientData.status_cliente === 'Apto'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : clientData.status_cliente === 'Rejeitado'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                {clientData.status_cliente}
                            </span>
                        )}
                    </div>

                    {/* Status Actions */}
                    {currentClientId && clientData && (
                        <div className="flex gap-2">
                            {(clientData.status_cliente === 'Pendente' || clientData.status_cliente === 'Rejeitado') && (
                                <button
                                    onClick={() => handleStatusChange('Apto')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                >
                                    Aprovar
                                </button>
                            )}

                            {(clientData.status_cliente === 'Pendente' || clientData.status_cliente === 'Apto' || clientData.status_cliente === 'Ativo') && (
                                <button
                                    onClick={() => handleStatusChange('Rejeitado')}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                >
                                    Rejeitar
                                </button>
                            )}

                            {currentClientId && clientData && (
                                <PDFDownloadLink
                                    document={<ContractPDF cliente={clientData} />}
                                    fileName={`Contrato_${clientData.nome_completo || clientData.razao_social || currentClientId}.pdf`}
                                    className="bg-[#002B49] hover:bg-[#001D32] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                                >
                                    {({ loading }) => (
                                        <>
                                            <FileText size={18} />
                                            {loading ? 'Gerando...' : 'Gerar Contrato'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Dados do cliente salvos com sucesso."
            />

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
                {/* Tabs */}
                <div className="px-8 pt-6 border-b border-slate-200">
                    <div className="flex gap-8">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isDisabled = !currentClientId && tab.id !== 'general';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                                    disabled={isDisabled}
                                    className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${isActive ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#002B49]'
                                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A3B1]"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-10 flex-1">
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
                            clientType={clientData?.tipo_cliente}
                            clientDocument={clientData?.tipo_cliente === 'Pessoa Jurídica' ? clientData?.cnpj : clientData?.cpf}
                        />
                    )}
                    {activeTab === 'contracts' && (
                        <ClientContractsTab
                            clientId={currentClientId || undefined}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientForm;
