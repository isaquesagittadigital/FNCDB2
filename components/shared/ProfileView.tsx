
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import AccessDataTab from './profile/AccessDataTab';
import GeneralDataTab from './profile/GeneralDataTab';
import AddressTab from './profile/AddressTab';
import BankDataTab from './profile/BankDataTab';
import { Loader2 } from 'lucide-react';

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('access');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAccounts();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

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

      setUserProfile({ ...userProfile, ...updates });
    } catch (error: any) {
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-[#00A3B1]" size={32} />
      </div>
    );
  }

  if (!userProfile) return <div>Erro ao carregar perfil.</div>;

  const tabs = [
    { id: 'access', label: 'Dados de acesso' },
    { id: 'general', label: 'Dados gerais' },
    { id: 'address', label: 'Endereço' },
    { id: 'bank', label: 'Dados bancários' }
  ];

  return (
    <div className="p-4 max-w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#002B49] mb-6">Meus dados</h1>

        <div className="flex gap-8 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-[#002B49]'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A3B1]"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 min-h-[600px]">
        {activeTab === 'access' && (
          <AccessDataTab
            userProfile={userProfile}
            onUpdate={handleUpdateProfile}
            saving={saving}
          />
        )}
        {activeTab === 'general' && (
          <GeneralDataTab
            userProfile={userProfile}
            onUpdate={handleUpdateProfile}
            saving={saving}
          />
        )}
        {activeTab === 'address' && (
          <AddressTab
            userProfile={userProfile}
            onUpdate={handleUpdateProfile}
            saving={saving}
          />
        )}
        {activeTab === 'bank' && (
          <BankDataTab
            userProfile={userProfile}
            accounts={accounts}
            refreshAccounts={fetchAccounts}
          />
        )}
      </main>
    </div>
  );
};

export default ProfileView;
