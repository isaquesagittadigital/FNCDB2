
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard } from 'lucide-react';

interface BankAccount {
    id: string;
    banco: string;
    agencia: string;
    conta: string;
    digito_agencia?: string;
    digito_conta?: string;
    tipo_conta?: string;
    is_default?: boolean;
}

interface ClientBankFormProps {
    clientId?: string;
}

const ClientBankForm: React.FC<ClientBankFormProps> = ({ clientId }) => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Account Form State
    const [newAccount, setNewAccount] = useState({
        banco: '',
        agencia: '',
        digito_agencia: '',
        conta: '',
        digito_conta: '',
        tipo_conta: 'Corrente',
        is_default: false
    });

    useEffect(() => {
        if (clientId) {
            fetchAccounts();
        }
    }, [clientId]);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts`);
            if (res.ok) {
                const data = await res.json();
                setAccounts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async () => {
        if (!clientId) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAccount)
            });

            if (res.ok) {
                const savedAccount = await res.json();
                setAccounts([...accounts, savedAccount]);
                setShowAddForm(false);
                setNewAccount({
                    banco: '',
                    agencia: '',
                    digito_agencia: '',
                    conta: '',
                    digito_conta: '',
                    tipo_conta: 'Corrente',
                    is_default: false
                });
            } else {
                alert('Erro ao salvar conta bancária');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar conta bancária');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setAccounts(accounts.filter(a => a.id !== id));
            } else {
                alert('Erro ao excluir conta');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir conta');
        }
    };

    if (!clientId) {
        return <div className="p-8 text-center text-slate-500">Salve os dados gerais do cliente primeiro para adicionar contas bancárias.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider">Dados bancários</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 text-sm font-bold text-[#00A3B1] hover:underline"
                >
                    <Plus size={16} />
                    Cadastrar conta
                </button>
            </div>

            {/* List */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-medium">Banco</th>
                            <th className="px-4 py-3 font-medium">Agência</th>
                            <th className="px-4 py-3 font-medium">Conta</th>
                            <th className="px-4 py-3 font-medium text-center">Padrão</th>
                            <th className="px-4 py-3 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {accounts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhuma conta cadastrada.</td>
                            </tr>
                        ) : (
                            accounts.map(acc => (
                                <tr key={acc.id} className="bg-white">
                                    <td className="px-4 py-3 font-medium text-[#002B49]">{acc.banco}</td>
                                    <td className="px-4 py-3 text-slate-500">{acc.agencia}-{acc.digito_agencia}</td>
                                    <td className="px-4 py-3 text-slate-500">{acc.conta}-{acc.digito_conta}</td>
                                    <td className="px-4 py-3 text-center">
                                        {acc.is_default && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded border border-emerald-200">Padrão</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(acc.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-top-2">
                    <h4 className="text-sm font-bold text-[#002B49] mb-4">Nova conta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-slate-500">Banco</label>
                            <input
                                value={newAccount.banco}
                                onChange={e => setNewAccount({ ...newAccount, banco: e.target.value })}
                                placeholder="Selecione ou digite o banco"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Agência</label>
                            <div className="flex gap-2">
                                <input
                                    value={newAccount.agencia}
                                    onChange={e => setNewAccount({ ...newAccount, agencia: e.target.value })}
                                    placeholder="0000"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                />
                                <input
                                    value={newAccount.digito_agencia}
                                    onChange={e => setNewAccount({ ...newAccount, digito_agencia: e.target.value })}
                                    placeholder="0"
                                    className="w-16 px-4 py-2 rounded-lg border border-slate-200"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Conta</label>
                            <div className="flex gap-2">
                                <input
                                    value={newAccount.conta}
                                    onChange={e => setNewAccount({ ...newAccount, conta: e.target.value })}
                                    placeholder="00000000"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                />
                                <input
                                    value={newAccount.digito_conta}
                                    onChange={e => setNewAccount({ ...newAccount, digito_conta: e.target.value })}
                                    placeholder="0"
                                    className="w-16 px-4 py-2 rounded-lg border border-slate-200"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Tipo de Conta</label>
                            <select
                                value={newAccount.tipo_conta}
                                onChange={e => setNewAccount({ ...newAccount, tipo_conta: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            >
                                <option value="Corrente">Corrente</option>
                                <option value="Poupança">Poupança</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddAccount}
                            className="px-4 py-2 bg-[#00A3B1] text-white rounded-lg hover:bg-[#008c99]"
                        >
                            Salvar conta
                        </button>
                    </div>
                </div>
            )}

            <div className="p-4 bg-sky-50 rounded-lg text-sm text-sky-800">
                Para atualizar os dados, entre em contato com o administrador. (Mock message per image)
            </div>
        </div>
    );
};

export default ClientBankForm;
