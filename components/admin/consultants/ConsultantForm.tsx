
import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, CheckCircle, FileText, TrendingUp, Users } from 'lucide-react';
import ConsultantGeneralForm from './tabs/ConsultantGeneralForm';
import ClientAddressForm from '../clients/tabs/ClientAddressForm';
import ClientBankForm from '../clients/tabs/ClientBankForm';
import ConsultantCommissionForm from './tabs/ConsultantCommissionForm';
import SuccessModal from '../../shared/modals/SuccessModal';

interface ConsultantFormProps {
    currentId?: string;
    onSuccess: () => void;
}

const ConsultantForm: React.FC<ConsultantFormProps> = ({ currentId: initialId, onSuccess }) => {
    const [currentId, setCurrentId] = useState<string | undefined>(initialId);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [consultantData, setConsultantData] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (currentId) {
            fetchConsultantData(currentId);
        }
    }, [currentId]);

    const fetchConsultantData = async (id: string) => {
        setLoading(true);
        try {
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
                }
                setConsultantData({ ...consultantData, ...saved });
                setShowSuccess(true);
                setActiveTab('address');
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
                setShowSuccess(true);
                setActiveTab('commission');
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

    const handleSaveCommission = async (data: any) => {
        if (!currentId) return;
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
                setShowSuccess(true);
                setActiveTab('bank');
            } else {
                alert('Erro ao salvar comissionamento');
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
        { id: 'commission', label: 'Comissionamento', icon: TrendingUp },
        { id: 'bank', label: 'Dados bancários', icon: CreditCard },
        { id: 'team', label: 'Equipe', icon: Users },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in-95 duration-500">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 bg-white px-4 md:px-10 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isDisabled = !currentId && tab.id !== 'general';

                    return (
                        <button
                            key={tab.id}
                            disabled={isDisabled}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-5 font-bold transition-all relative whitespace-nowrap
                                ${isActive
                                    ? 'text-[#00A3B1] border-b-2 border-[#00A3B1]'
                                    : 'text-slate-400 hover:text-slate-600'}
                                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <Icon size={16} className={isActive ? 'text-[#00A3B1]' : 'text-slate-400'} />
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6 md:p-10">
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

                {activeTab === 'commission' && (
                    <ConsultantCommissionForm
                        initialData={consultantData}
                        onSubmit={handleSaveCommission}
                        loading={loading}
                    />
                )}

                {activeTab === 'bank' && (
                    <div className="space-y-8">
                        <ClientBankForm
                            clientId={currentId}
                            clientType="Pessoa Jurídica"
                            clientDocument={consultantData?.cnpj}
                        />
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users size={48} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-[#002B49] mb-1">Equipe do Consultor</h3>
                        <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
                    </div>
                )}
            </div>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Dados salvos com sucesso."
            />
        </div>
    );
};

export default ConsultantForm;
