
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import AccessDataTab from './profile/AccessDataTab';
import GeneralDataTab from './profile/GeneralDataTab';
import AddressTab from './profile/AddressTab';
import BankDataTab from './profile/BankDataTab';
import { Loader2 } from 'lucide-react';

interface ProfileViewProps {
  readOnly?: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ readOnly = false }) => {
  const [activeTab, setActiveTab] = useState('access');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('[ProfileView] auth user:', user?.id, 'error:', authError?.message || 'none');
      if (!user) return;

      // Fetch profile separately from bank accounts
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('[ProfileView] profile:', profileData?.id, 'error:', profileError?.message || 'none');

      if (profileData) {
        setUserProfile(profileData);
      }

      // Fetch bank accounts separately - don't fail if this errors
      try {
        const { data: accountsData, error: accountsError } = await supabase
          .from('contas_bancarias')
          .select('*')
          .eq('user_id', user.id);

        console.log('[ProfileView] accounts:', accountsData?.length, 'error:', accountsError?.message || 'none');

        if (accountsData) {
          setAccounts(accountsData);
        }
      } catch (accError) {
        console.warn('[ProfileView] Failed to load bank accounts:', accError);
      }
    } catch (error) {
      console.error('[ProfileView] Erro ao carregar dados:', error);
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

  const tabs = [
    { id: 'access', label: 'Dados de acesso' },
    { id: 'general', label: 'Dados gerais' },
    { id: 'address', label: 'Endereço' },
    { id: 'bank', label: 'Dados bancários' }
  ];

  if (!userProfile && !loading) return <div>Erro ao carregar perfil.</div>;

  return (
    <div className="p-4 max-w-full mx-auto">
      <header className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#002B49] mb-6">Meus dados</h1>

        <div className="flex gap-4 sm:gap-8 border-b border-slate-200 overflow-x-auto no-scrollbar">
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

      <main className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 shadow-sm border border-slate-100 min-h-[400px] sm:min-h-[600px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-[#00A3B1]" size={32} />
          </div>
        ) : (
          <>
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
                readOnly={readOnly}
              />
            )}
            {activeTab === 'address' && (
              <AddressTab
                userProfile={userProfile}
                onUpdate={handleUpdateProfile}
                saving={saving}
                readOnly={readOnly}
              />
            )}
            {activeTab === 'bank' && (
              <BankDataTab
                userProfile={userProfile}
                accounts={accounts}
                refreshAccounts={fetchAccounts}
                readOnly={readOnly}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileView;
