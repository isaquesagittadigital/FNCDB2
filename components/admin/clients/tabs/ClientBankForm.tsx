
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { Field, SelectField } from '../../../shared/ui/FormElements';
import SuccessModal from '../../../shared/ui/SuccessModal';

interface BankAccount {
    id?: string; // Optional for new accounts
    banco: string;
    agencia: string;
    conta: string;
    digito_agencia?: string;
    digito_conta?: string;
    tipo_conta?: string;
    cpf_cnpj?: string;
    is_default?: boolean;
}

interface ClientBankFormProps {
    clientId?: string;
    clientType?: 'Pessoa Física' | 'Pessoa Jurídica';
    clientDocument?: string;
}

const ClientBankForm: React.FC<ClientBankFormProps> = ({ clientId, clientType, clientDocument }) => {
    const [loading, setLoading] = useState(false);
    const [banksList, setBanksList] = useState<{ name: string, code: number }[]>([]);
    const [showBankSuggestions, setShowBankSuggestions] = useState(false);
    const [filteredBanks, setFilteredBanks] = useState<{ name: string, code: number }[]>([]);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Single Account State
    const [bankAccount, setBankAccount] = useState<BankAccount>({
        banco: '',
        agencia: '',
        digito_agencia: '',
        conta: '',
        digito_conta: '',
        tipo_conta: 'Corrente',
        cpf_cnpj: '',
        is_default: true
    });

    useEffect(() => {
        if (clientId) {
            fetchAccount();
        }
        fetchBanks();
    }, [clientId]);

    const fetchBanks = async () => {
        try {
            const res = await fetch('https://brasilapi.com.br/api/banks/v1');
            if (res.ok) {
                const data = await res.json();
                setBanksList(data);
            }
        } catch (error) {
            console.error("Failed to fetch banks", error);
        }
    };

    useEffect(() => {
        // Only set default if no account loaded yet
        if (clientDocument && !bankAccount.id) {
            setBankAccount(prev => ({ ...prev, cpf_cnpj: clientDocument }));
        }
    }, [clientDocument, bankAccount.id]);

    const fetchAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts`);
            if (res.ok) {
                const data = await res.json();
                // Take the first account if exists, otherwise keep default empty state
                if (data && data.length > 0) {
                    setBankAccount(data[0]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        if (!clientId) return;
        setLoading(true);

        try {
            // Determine endpoint and method
            // If ID exists, we try to UPDATE (PUT), assuming backend supports it.
            const endpoint = bankAccount.id
                ? `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts/${bankAccount.id}`
                : `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts`;

            const method = bankAccount.id ? 'PUT' : 'POST';

            // Ensure payload is clean
            const payload = { ...bankAccount };
            if (!payload.cpf_cnpj) payload.cpf_cnpj = clientDocument; // Ensure document is there

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const savedData = await res.json();
                setBankAccount(savedData);
                setModalMessage("Dados bancários salvos com sucesso!");
                setShowSuccessModal(true);
            } else {
                const err = await res.json();
                alert(`Erro ao salvar: ${err.error || 'Erro desconhecido'}`);
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao salvar conta bancária');
        } finally {
            setLoading(false);
        }
    };

    if (!clientId) {
        return <div className="p-8 text-center text-slate-500">Salve os dados gerais do cliente primeiro para adicionar contas bancárias.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Dados bancários</h3>
            </div>

            <div className="">
                <datalist id="banks-list">
                    {banksList.map((b) => (
                        <option key={b.code} value={b.name} />
                    ))}
                </datalist>

                <div className="space-y-6">
                    {/* Row 1: Documento & Banco */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field
                            label={`Documento (${clientType === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'})`}
                            value={bankAccount.cpf_cnpj}
                            onChange={(val) => setBankAccount({ ...bankAccount, cpf_cnpj: val })}
                            required
                            mask={clientType === 'Pessoa Jurídica' ? "00.000.000/0000-00" : "000.000.000-00"}
                            placeholder={clientType === 'Pessoa Jurídica' ? "00.000.000/0000-00" : "000.000.000-00"}
                        />

                        {/* Custom Bank Search Autocomplete */}
                        <div className="space-y-2 relative">
                            <label className="flex items-center gap-1 text-sm font-bold text-[#002B49]">
                                Banco <span className="text-[#00A3B1]">*</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={bankAccount.banco}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBankAccount({ ...bankAccount, banco: val });
                                        // Filter banks
                                        if (val.length > 0) {
                                            const filtered = banksList.filter(b =>
                                                b.name?.toLowerCase().includes(val.toLowerCase()) ||
                                                b.code?.toString().includes(val)
                                            );
                                            // Only show top 50 to avoid lag
                                            setFilteredBanks(filtered.slice(0, 50));
                                            setShowBankSuggestions(true);
                                        } else {
                                            setShowBankSuggestions(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        // Show all or filtered
                                        const val = bankAccount.banco;
                                        const filtered = banksList.filter(b =>
                                            b.name?.toLowerCase().includes(val.toLowerCase()) ||
                                            b.code?.toString().includes(val)
                                        );
                                        setFilteredBanks(filtered.slice(0, 50));
                                        setShowBankSuggestions(true);
                                    }}
                                    onBlur={() => {
                                        // Timeout to allow click on item
                                        setTimeout(() => setShowBankSuggestions(false), 200);
                                    }}
                                    placeholder="Digite ou selecione o banco"
                                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>

                                {showBankSuggestions && filteredBanks.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                        {filteredBanks.map((b, idx) => (
                                            <div
                                                key={`${b.code}-${idx}`}
                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setBankAccount({ ...bankAccount, banco: `${b.code} - ${b.name}` });
                                                    setShowBankSuggestions(false);
                                                }}
                                            >
                                                <span className="font-bold text-[#002B49] mr-2">{b.code}</span>
                                                {b.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Agencia & Conta */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <Field
                                label="Agência"
                                value={bankAccount.agencia}
                                onChange={(val) => setBankAccount({ ...bankAccount, agencia: val.replace(/\D/g, '').slice(0, 8) })}
                                required
                                placeholder="00000000"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Field
                                label="Dígito (agência)"
                                value={bankAccount.digito_agencia}
                                onChange={(val) => setBankAccount({ ...bankAccount, digito_agencia: val })}
                                placeholder="0"
                                required
                                mask="0"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Field
                                label="Conta"
                                value={bankAccount.conta}
                                onChange={(val) => setBankAccount({ ...bankAccount, conta: val.replace(/\D/g, '').slice(0, 8) })}
                                required
                                placeholder="00000000"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Field
                                label="Dígito (conta)"
                                value={bankAccount.digito_conta}
                                onChange={(val) => setBankAccount({ ...bankAccount, digito_conta: val })}
                                required
                                placeholder="0"
                                mask="0"
                            />
                        </div>
                    </div>

                    {/* Row 3: Tipo de Conta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField
                            label="Tipo de conta"
                            value={bankAccount.tipo_conta}
                            onChange={(val) => setBankAccount({ ...bankAccount, tipo_conta: val })}
                            required
                            options={[
                                { value: 'Corrente', label: 'Corrente' },
                                { value: 'Poupança', label: 'Poupança' },
                                { value: 'Pagamentos', label: 'Pagamentos' },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSaveAccount}
                        disabled={loading}
                        className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#00A3B1]/20 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00A3B1] hover:bg-[#008c99]'}`}
                    >
                        <CheckCircle size={20} />
                        {loading ? 'Salvando...' : 'Salvar dados bancários'}
                    </button>
                </div>
            </div>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Sucesso!"
                message={modalMessage}
            />
        </div>
    );
};

export default ClientBankForm;
