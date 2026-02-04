
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, CreditCard, Loader2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AccessDataTab from '../shared/profile/AccessDataTab';
import GeneralDataTab from '../shared/profile/GeneralDataTab';
import AddressTab from '../shared/profile/AddressTab';
import BankDataTab from '../shared/profile/BankDataTab';
import SuccessModal from '../shared/modals/SuccessModal';

const ConsultantProfileView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('access');
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [profileRes, accountsRes] = await Promise.all([
                supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', user.id)
                    .single(),
                supabase
                    .from('contas_bancarias')
                    .select('*')
                    .eq('user_id', user.id)
            ]);

            if (profileRes.error) throw profileRes.error;
            if (accountsRes.error) throw accountsRes.error;

            setUserProfile(profileRes.data);
            setAccounts(accountsRes.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const fetchAccounts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('contas_bancarias')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            setAccounts(data || []);
        } catch (error) {
            console.error('Erro ao buscar contas:', error);
        }
    };

    const handleUpdateProfile = async (updates: any) => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('usuarios')
                .update(updates)
                .eq('id', userProfile.id);

            if (error) throw error;

            setUserProfile((prev: any) => ({ ...prev, ...updates }));
            setShowSuccess(true);
        } catch (error: any) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'access', label: 'Dados de acesso', icon: Shield },
        { id: 'general', label: 'Dados gerais', icon: User },
        { id: 'address', label: 'Endereço', icon: MapPin },
        { id: 'bank', label: 'Dados bancários', icon: CreditCard },
    ];

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#00A3B1]" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 max-w-full mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-[#002B49] mb-6">Meus Dados</h1>

                <div className="flex border-b border-slate-100 bg-white px-4 md:px-10 overflow-x-auto scrollbar-hide rounded-t-2xl border-t border-x">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-5 font-bold transition-all relative whitespace-nowrap
                                    ${isActive
                                        ? 'text-[#00A3B1] border-b-2 border-[#00A3B1]'
                                        : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                <Icon size={16} className={isActive ? 'text-[#00A3B1]' : 'text-slate-400'} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className="bg-white rounded-b-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px]">
                <div className="flex-1 p-6 md:p-10">
                    {activeTab === 'access' && (
                        <AccessDataTab
                            userProfile={userProfile}
                            onUpdate={handleUpdateProfile}
                            saving={saving}
                            readOnly={false}
                        />
                    )}

                    {activeTab === 'general' && (
                        <GeneralDataTab
                            userProfile={userProfile}
                            onUpdate={handleUpdateProfile}
                            saving={saving}
                            readOnly={true}
                        />
                    )}

                    {activeTab === 'address' && (
                        <AddressTab
                            userProfile={userProfile}
                            onUpdate={handleUpdateProfile}
                            saving={saving}
                            readOnly={true}
                        />
                    )}

                    {activeTab === 'bank' && (
                        <BankDataTab
                            userProfile={userProfile}
                            accounts={accounts}
                            refreshAccounts={fetchAccounts}
                            readOnly={true}
                        />
                    )}
                </div>
            </main>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Seus dados foram atualizados com sucesso."
            />
        </div>
    );
};

export default ConsultantProfileView;
