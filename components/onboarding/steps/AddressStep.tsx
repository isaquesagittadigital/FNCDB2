import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { fetchAddressByCEP } from '../../../utils/viacep';
import { fetchBanks } from '../../../utils/banks';

interface AddressStepProps {
    onNext: () => void;
    onBack: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ onNext, onBack, data, onUpdate }) => {
    const [useResidentialAddress, setUseResidentialAddress] = useState(false);
    const [bankList, setBankList] = useState<{ code: string; name: string }[]>([]);

    useEffect(() => {
        const loadBanks = async () => {
            const banks = await fetchBanks();
            setBankList(banks);
        };
        loadBanks();
    }, []);

    useEffect(() => {
        // Auto-fill Titular CPF with user CPF if not set
        if (!data?.bankAccount?.cpf_titular && data?.cpf) {
            handleBankChange('cpf_titular', data.cpf);
        }
        // Auto-fill Titular Name with user Name if not set
        if (!data?.bankAccount?.titular && data?.nome_fantasia) {
            handleBankChange('titular', data.nome_fantasia);
        }
    }, [data?.cpf, data?.nome_fantasia]);

    const handleChange = (field: string, value: string) => {
        onUpdate({ [field]: value });
    };

    const handleBankChange = (field: string, value: string) => {
        onUpdate({
            bankAccount: {
                ...data.bankAccount,
                [field]: value
            }
        });
    };

    const handleCEPBlur = async () => {
        const cep = data?.cep_correspondencia?.replace(/\D/g, '') || '';
        if (cep.length === 8) {
            const address = await fetchAddressByCEP(cep);
            if (address) {
                onUpdate({
                    logradouro_correspondencia: address.logradouro,
                    cidade_correspondencia: address.localidade,
                    uf_correspondencia: address.uf,
                    cep_correspondencia: data.cep_correspondencia
                });
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Endereço e dados bancários</h2>
            </div>

            {/* Endereço para correspondências Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Endereço para correspondências</h3>

                <div className="flex items-center mb-6">
                    <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${useResidentialAddress ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}
                        onClick={() => {
                            const newValue = !useResidentialAddress;
                            setUseResidentialAddress(newValue);
                            if (newValue) {
                                onUpdate({
                                    logradouro_correspondencia: data.logradouro,
                                    numero_correspondencia: data.numero,
                                    complemento_correspondencia: data.complemento,
                                    bairro_correspondencia: data.bairro,
                                    cidade_correspondencia: data.cidade,
                                    uf_correspondencia: data.uf,
                                    cep_correspondencia: data.cep
                                });
                            }
                        }}
                    >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${useResidentialAddress ? 'translate-x-[20px]' : ''}`} />
                    </div>
                    <span className="ml-3 text-sm text-slate-600 font-medium">Utilizar o mesmo endereço residencial</span>
                </div>

                <div className={`grid grid-cols-12 gap-6 transition-all duration-300 ${useResidentialAddress ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CEP</label>
                        <IMaskInput
                            mask="00000-000"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            value={data?.cep_correspondencia || ''}
                            onAccept={(value: string) => handleChange('cep_correspondencia', value)}
                            onBlur={handleCEPBlur}
                            placeholder="00000-000"
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-7">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço completo</label>
                        <input
                            type="text"
                            value={data?.logradouro_correspondencia || ''}
                            onChange={(e) => handleChange('logradouro_correspondencia', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all"
                            placeholder="Rua, Avenida..."
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Número *</label>
                        <input
                            type="text"
                            value={data?.numero_correspondencia || ''}
                            onChange={(e) => handleChange('numero_correspondencia', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Complemento</label>
                        <input
                            type="text"
                            value={data?.complemento_correspondencia || ''}
                            onChange={(e) => handleChange('complemento_correspondencia', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro</label>
                        <input
                            type="text"
                            value={data?.bairro_correspondencia || ''}
                            onChange={(e) => handleChange('bairro_correspondencia', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
                            value={data?.cidade_correspondencia || ''}
                            onChange={(e) => handleChange('cidade_correspondencia', e.target.value)}
                            readOnly={useResidentialAddress}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">UF *</label>
                        <div className="relative">
                            <input
                                type="text"
                                maxLength={2}
                                value={data?.uf_correspondencia || ''}
                                onChange={(e) => handleChange('uf_correspondencia', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                                readOnly={useResidentialAddress}
                            />
                        </div>
                    </div>

                    <div className="col-span-12">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">País *</label>
                        <div className="relative">
                            <select className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] pr-10" disabled={useResidentialAddress}>
                                <option>Brasil</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dados Bancário Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Dados bancário</h3>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Importante:</span><br />
                        Informe a conta bancária onde deseja receber as distribuições mensais de rendimentos. A titularidade deve ser a mesma do investidor.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Banco *</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] pr-10"
                                value={data?.bankAccount?.banco || ''}
                                onChange={(e) => handleBankChange('banco', e.target.value)}
                            >
                                <option value="">Selecione</option>
                                {bankList.map(bank => (
                                    <option key={bank.code} value={`${bank.code} - ${bank.name}`}>
                                        {bank.code && `${bank.code} - `}{bank.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agência</label>
                            <input
                                type="text"
                                maxLength={5}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                                value={data?.bankAccount?.agencia || ''}
                                onChange={(e) => handleBankChange('agencia', e.target.value.replace(/\D/g, ''))}
                                placeholder="0000"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dígito</label>
                            <input
                                type="text"
                                maxLength={1}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] text-center"
                                value={data?.bankAccount?.digito_agencia || ''}
                                onChange={(e) => handleBankChange('digito_agencia', e.target.value.replace(/[^0-9xX]/g, '').toUpperCase())}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Conta</label>
                            <input
                                type="text"
                                maxLength={12}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                                value={data?.bankAccount?.conta || ''}
                                onChange={(e) => handleBankChange('conta', e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dígito</label>
                            <input
                                type="text"
                                maxLength={1}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] text-center"
                                value={data?.bankAccount?.digito_conta || ''}
                                onChange={(e) => handleBankChange('digito_conta', e.target.value.replace(/[^0-9xX]/g, '').toUpperCase())}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de conta *</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] pr-10"
                                value={data?.bankAccount?.tipo_conta || ''}
                                onChange={(e) => handleBankChange('tipo_conta', e.target.value)}
                            >
                                <option value="">Selecione</option>
                                <option value="Corrente">Corrente</option>
                                <option value="Poupança">Poupança</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Titular da conta *</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            value={data?.bankAccount?.titular || ''}
                            onChange={(e) => handleBankChange('titular', e.target.value)}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CPF do titular *</label>
                        <IMaskInput
                            mask="000.000.000-00"
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9]"
                            value={data?.bankAccount?.cpf_titular || ''}
                            onAccept={(value: string) => handleBankChange('cpf_titular', value)}
                            placeholder="000.000.000-00"
                        />
                    </div>
                </div>

                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4">
                    <p className="text-sm text-[#92400E]">
                        <span className="font-bold">Importante:</span><br />
                        A conta bancária deve estar em nome do investidor. Contas de terceiros não serão aceitas para fins de distribuição.
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-2.5 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] transition-colors shadow-lg shadow-teal-500/20"
                >
                    Confirmar e continuar
                </button>
            </div>

        </div>
    );
};
export default AddressStep;
