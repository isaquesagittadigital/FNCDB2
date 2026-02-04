
import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Field, FormSection } from '../ui/FormElements';
import SuccessModal from '../modals/SuccessModal';
import DataUpdateModal from '../modals/DataUpdateModal';
import { api, Bank } from '../../../services/api';

interface BankDataTabProps {
    userProfile: any;
    accounts: any[];
    refreshAccounts: () => void;
    readOnly?: boolean;
}

const BankDataTab: React.FC<BankDataTabProps> = ({ userProfile, accounts, refreshAccounts, readOnly }) => {
    const [saving, setSaving] = useState(false);
    const [bankList, setBankList] = useState<Bank[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
    const [showBankList, setShowBankList] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Single account state - initialize from first account or defaults
    const [formData, setFormData] = useState({
        id: '',
        banco: '',
        agencia: '',
        digito_agencia: '',
        conta: '',
        digito_conta: '',
        tipo_conta: 'Corrente',
        cnpj_favorecido: userProfile.cnpj || userProfile.cpf || ''
    });

    useEffect(() => {
        loadBanks();
        if (accounts && accounts.length > 0) {
            const acc = accounts[0];
            setFormData({
                id: acc.id,
                banco: acc.banco || '',
                agencia: acc.agencia || '',
                digito_agencia: acc.digito_agencia || '',
                conta: acc.conta || '',
                digito_conta: acc.digito_conta || '',
                tipo_conta: acc.tipo_conta || 'Corrente',
                cnpj_favorecido: acc.cpf_cnpj_conta || userProfile.cnpj || userProfile.cpf || ''
            });
        }
    }, [accounts, userProfile]);

    const loadBanks = async () => {
        const banks = await api.getBanks();
        setBankList(banks);
    };

    const handleSearchBank = (query: string) => {
        setFormData(prev => ({ ...prev, banco: query }));
        if (query) {
            setFilteredBanks(bankList.filter(b =>
            (b.name?.toLowerCase().includes(query.toLowerCase()) ||
                b.fullName?.toLowerCase().includes(query.toLowerCase()) ||
                b.code?.toString().includes(query))
            ).slice(0, 10));
            setShowBankList(true);
        } else {
            setShowBankList(false);
        }
    };

    const handleSelectBank = (bank: Bank) => {
        setFormData(prev => ({ ...prev, banco: `${bank.code} - ${bank.name}` }));
        setShowBankList(false);
    };

    const handleSave = async () => {
        if (!formData.banco || !formData.agencia || !formData.conta) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        try {
            setSaving(true);
            const dataToSave = {
                user_id: userProfile.id,
                banco: formData.banco,
                agencia: formData.agencia,
                digito_agencia: formData.digito_agencia,
                conta: formData.conta,
                digito_conta: formData.digito_conta,
                tipo_conta: formData.tipo_conta,
                cpf_cnpj_conta: formData.cnpj_favorecido
            };

            let error;

            if (formData.id) {
                // Update existing
                const res = await supabase
                    .from('contas_bancarias')
                    .update(dataToSave)
                    .eq('id', formData.id);
                error = res.error;
            } else {
                // Insert new
                const res = await supabase
                    .from('contas_bancarias')
                    .insert(dataToSave);
                error = res.error;
            }

            if (error) throw error;

            refreshAccounts();
            setShowSuccess(true);
        } catch (e: any) {
            alert("Erro ao salvar dados bancários: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Dados bancários atualizados com sucesso."
                title="Dados salvos"
            />

            <FormSection title="Dados bancários">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Row 1 */}
                    <div className="md:col-span-4">
                        <Field
                            label="Documento (CNPJ)"
                            value={formData.cnpj_favorecido}
                            onChange={(v) => setFormData({ ...formData, cnpj_favorecido: v })}
                            mask={formData.cnpj_favorecido.length > 14 ? "00.000.000/0000-00" : "000.000.000-00"}
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="md:col-span-8 relative">
                        <Field
                            label="Banco"
                            value={formData.banco}
                            onChange={handleSearchBank}
                            placeholder="Digite o banco"
                            required
                            disabled={readOnly}
                        />
                        {showBankList && filteredBanks.length > 0 && !readOnly && (
                            <div className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl rounded-xl z-20 max-h-60 overflow-y-auto mt-1">
                                {filteredBanks.map(b => (
                                    <button
                                        key={b.ispb}
                                        onClick={() => handleSelectBank(b)}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex flex-col"
                                    >
                                        <span className="font-bold text-[#002B49]">{b.code} - {b.name}</span>
                                        <span className="text-xs text-slate-400">{b.fullName}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Row 2 */}
                    <div className="md:col-span-4">
                        <Field
                            label="Agência"
                            value={formData.agencia}
                            onChange={(v) => setFormData({ ...formData, agencia: v })}
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Field
                            label="Dígito (agência)"
                            value={formData.digito_agencia}
                            onChange={(v) => setFormData({ ...formData, digito_agencia: v })}
                            required
                            disabled={readOnly}
                        />
                    </div>

                    <div className="md:col-span-4">
                        <Field
                            label="Conta"
                            value={formData.conta}
                            onChange={(v) => setFormData({ ...formData, conta: v })}
                            required
                            disabled={readOnly}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Field
                            label="Dígito (conta)"
                            value={formData.digito_conta}
                            onChange={(v) => setFormData({ ...formData, digito_conta: v })}
                            required
                            disabled={readOnly}
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="md:col-span-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#002B49]">Tipo de conta<span className="text-[#00A3B1]">*</span></label>
                            <select
                                value={formData.tipo_conta}
                                onChange={(e) => setFormData({ ...formData, tipo_conta: e.target.value })}
                                disabled={readOnly}
                                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] disabled:bg-slate-50 disabled:text-slate-400 appearance-none"
                            >
                                <option value="Corrente">Corrente</option>
                                <option value="Poupança">Poupança</option>
                                <option value="Pagamento">Pagamento</option>
                            </select>
                        </div>
                    </div>
                </div>
            </FormSection>

            {readOnly && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowUpdateModal(true)}
                        className="text-[#00A3B1] text-xs font-semibold hover:underline"
                    >
                        Para atualizar os dados, entre em contato com o administrador.
                    </button>
                </div>
            )}

            {!readOnly && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all disabled:opacity-50">
                        <CheckCircle2 size={18} />
                        {saving ? 'Salvando...' : 'Salvar dados bancários'}
                    </button>
                </div>
            )}

            <DataUpdateModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
            />
        </div>
    );
};

export default BankDataTab;
