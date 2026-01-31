
import React, { useEffect, useState } from 'react';
import { FileText, MapPin, CreditCard, ChevronDown, Check } from 'lucide-react';

interface ClientReviewStepProps {
    formData: any;
    clientId: string;
    onBack: () => void;
    onFinalize: () => void;
}

const Section: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Icon size={18} className="text-[#002B49]" />
                <h3 className="font-bold text-[#002B49] text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};

const Field: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="mb-4 last:mb-0">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
        <div className="text-sm font-medium text-slate-700">{value || '-'}</div>
    </div>
);

const ClientReviewStep: React.FC<ClientReviewStepProps> = ({ formData, clientId, onBack, onFinalize }) => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loadingBank, setLoadingBank] = useState(false);

    useEffect(() => {
        if (clientId) {
            setLoadingBank(true);
            fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${clientId}/bank-accounts`)
                .then(res => res.json())
                .then(data => setAccounts(data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingBank(false));
        }
    }, [clientId]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3">
                <Check className="text-emerald-600 mt-0.5" size={20} />
                <div>
                    <h3 className="text-emerald-800 font-bold text-sm">Pronto para finalizar</h3>
                    <p className="text-emerald-600 text-xs mt-1">
                        Revise os dados abaixo. Se tudo estiver correto, clique em "Finalizar Cadastro".
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Data */}
                <Section title="Dados Gerais" icon={FileText}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Tipo e Cliente" value={formData.tipo_cliente} />
                        <Field label="Nome / Razão Social" value={formData.nome_fantasia || formData.razao_social} />
                        <Field label="Documento" value={formData.cpf || formData.cnpj} />
                        <Field label="Email" value={formData.email} />
                        <Field label="Celular" value={formData.celular} />
                        <Field label="Consultor ID" value={formData.consultant_id} />
                    </div>
                </Section>

                {/* Address Data */}
                <Section title="Endereço" icon={MapPin}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="CEP" value={formData.cep} />
                        <div className="col-span-2">
                            <Field label="Logradouro" value={`${formData.logradouro || ''}, ${formData.numero || 'S/N'}`} />
                        </div>
                        <Field label="Bairro" value={formData.bairro} />
                        <Field label="Cidade/UF" value={`${formData.cidade || ''} - ${formData.uf || ''}`} />
                    </div>
                </Section>
            </div>

            {/* Bank Data */}
            <Section title="Dados Bancários" icon={CreditCard}>
                {loadingBank ? (
                    <div className="text-center py-4 text-slate-400 text-sm">Carregando contas...</div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm italic">Nenhuma conta bancária cadastrada.</div>
                ) : (
                    <div className="space-y-3">
                        {accounts.map((acc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                                <div>
                                    <div className="font-bold text-[#002B49] text-sm">{acc.banco}</div>
                                    <div className="text-xs text-slate-500">
                                        Ag: {acc.agencia}-{acc.digito_agencia} | CC: {acc.conta}-{acc.digito_conta}
                                    </div>
                                </div>
                                <div className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 font-mono">
                                    {acc.tipo_conta}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-slate-100 gap-4">
                <button
                    onClick={onBack}
                    className="mr-auto px-6 py-2.5 text-slate-500 font-medium hover:text-slate-700"
                >
                    Voltar
                </button>
                <button
                    onClick={onFinalize}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                >
                    <Check size={20} />
                    Finalizar Cadastro
                </button>
            </div>
        </div>
    );
};

export default ClientReviewStep;
