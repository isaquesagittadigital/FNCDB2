
import React from 'react';
import { ArrowLeft, Edit2, Check } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { fetchAddressByCEP } from '../../../utils/viacep';

const UFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const OrgaosEmissores = [
    'SSP', 'DETRAN', 'PF', 'Cartório Civil', 'OAB', 'CREA', 'CRM', 'Outros'
];

interface PersonalDataStepProps {
    onNext: () => void;
    data: any;
    onUpdate: (data: any) => void;
}

const PersonalDataStep: React.FC<PersonalDataStepProps> = ({ onNext, data, onUpdate }) => {
    const [isEditing, setIsEditing] = React.useState(false);

    const handleChange = (field: string, value: string) => {
        onUpdate({ [field]: value });
    };

    const handleCEPBlur = async () => {
        const cep = data?.cep?.replace(/\D/g, '') || '';
        if (cep.length === 8) {
            const address = await fetchAddressByCEP(cep);
            if (address) {
                onUpdate({
                    logradouro: address.logradouro,
                    bairro: address.bairro,
                    cidade: address.localidade,
                    uf: address.uf,
                    cep: data.cep // Keep current value
                });
            }
        }
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Dados cadastrais</h2>
            </div>

            {/* Dados Cadastrais Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Importante:</span><br />
                        Verifique se seus dados estão corretos. Caso haja alguma informação incorreta, clique em 'Editar' para fazer as alterações necessárias.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.nome_fantasia || ''}
                                onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.nome_fantasia || 'Nome não informado'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nacionalidade</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.nacionalidade || ''}
                                onChange={(e) => handleChange('nacionalidade', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.nacionalidade || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado civil *</label>
                        {isEditing ? (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                <select
                                    className="w-full bg-transparent outline-none"
                                    value={data?.estado_civil || ''}
                                    onChange={(e) => handleChange('estado_civil', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    <option value="Solteiro">Solteiro</option>
                                    <option value="Casado">Casado</option>
                                    <option value="Divorciado">Divorciado</option>
                                    <option value="Viúvo">Viúvo</option>
                                </select>
                            </div>
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                {data?.estado_civil || 'Selecione'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de nascimento</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={data?.data_nascimento || ''}
                                onChange={(e) => handleChange('data_nascimento', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.data_nascimento || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Profissão</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.profissao || ''}
                                onChange={(e) => handleChange('profissao', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.profissao || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        {/* Email is now handled in Contact section, but we can keep it here or remove it if redundant. 
                             The user asked for email in Contact section to be editable.
                             I will comment out/remove this read-only block if it's duplicated in Contact section. 
                             Wait, the existing code had Email in TWO places (Personal Data top section AND Contact section).
                             Lines 121-126 are in the top "Dados Cadastrais" grid.
                             Lines 290-295 are in "Contato" card.
                             
                             I should probably keep both in sync or just make both editable? 
                             Or maybe removing the top one if it's redundant? 
                             The design usually has Personal Info (Name, Nationality, DOB, Job).
                             Email usually goes in Contact. 
                             I will leave this distinct block as read-only or just remove it to clean up?
                             The user said "em Contato o campo de email, deve ficar ativo".
                             So I will LEAVE this top section as is (read-only) or maybe it's just a display.
                             Actually, let's make it consistent. If I edit email in Contact, it should update here too. 
                             I'll leave it read-only here as it wasn't explicitly asked to be changed here, only in "Contato".
                         */}
                        <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                            {data?.email || data?.auth_email || 'Email não informado'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentos Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CPF</label>
                        {isEditing ? (
                            <IMaskInput
                                mask="000.000.000-00"
                                value={data?.cpf || ''}
                                onAccept={(value: string) => handleChange('cpf', value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                                placeholder="000.000.000-00"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.cpf || 'CPF não informado'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">RG</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.rg || ''}
                                onChange={(e) => handleChange('rg', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.rg || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Órgão emissor</label>
                        {isEditing ? (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                <select
                                    className="w-full bg-transparent outline-none"
                                    value={data?.orgao_emissor || ''}
                                    onChange={(e) => handleChange('orgao_emissor', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {OrgaosEmissores.map(org => (
                                        <option key={org} value={org}>{org}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.orgao_emissor || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">UF emissor *</label>
                        {isEditing ? (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                <select
                                    className="w-full bg-transparent outline-none"
                                    value={data?.uf_rg || ''}
                                    onChange={(e) => handleChange('uf_rg', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {UFs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                {data?.uf_rg || 'UF'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Endereço Residencial Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Endereço residencial</h3>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">CEP</label>
                        {isEditing ? (
                            <IMaskInput
                                mask="00000-000"
                                value={data?.cep || ''}
                                onAccept={(value: string) => handleChange('cep', value)}
                                onBlur={handleCEPBlur}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm"
                                placeholder="00000-000"
                            />
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                                {data?.cep || '00000-000'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-7">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço completo</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.logradouro || ''}
                                onChange={(e) => handleChange('logradouro', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm"
                            />
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                                {data?.logradouro || 'Endereço não informado'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Número *</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.numero || ''}
                                onChange={(e) => handleChange('numero', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm"
                            />
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                                {data?.numero || 'S/N'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Complemento</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.complemento || ''}
                                onChange={(e) => handleChange('complemento', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm"
                            />
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                                {data?.complemento || '-'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bairro</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.bairro || ''}
                                onChange={(e) => handleChange('bairro', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm"
                            />
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-sm">
                                {data?.bairro || '-'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data?.cidade || ''}
                                onChange={(e) => handleChange('cidade', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.cidade || 'N/A'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">UF</label>
                        {isEditing ? (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center">
                                <select
                                    className="w-full bg-transparent outline-none"
                                    value={data?.uf || ''}
                                    onChange={(e) => handleChange('uf', e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {UFs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 flex justify-between items-center shadow-sm">
                                {data?.uf || 'UF'}
                            </div>
                        )}
                    </div>

                    <div className="col-span-12">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">País</label>
                        <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex justify-between items-center">
                            Brasil
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contato Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={data?.email || data?.auth_email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                                placeholder="Digite seu email"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.email || data?.auth_email || 'Email não informado'}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                        {isEditing ? (
                            <IMaskInput
                                mask="(00) 00000-0000"
                                value={data?.celular || ''}
                                onAccept={(value: string) => handleChange('celular', value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800"
                                placeholder="(00) 00000-0000"
                            />
                        ) : (
                            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                {data?.celular || 'N/A'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-6">
                <button className="flex items-center text-slate-500 hover:text-slate-700 font-medium transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm"
                    >
                        <Edit2 size={16} className="mr-2" />
                        {isEditing ? 'Cancelar Edição' : 'Editar'}
                    </button>
                    <button
                        onClick={onNext}
                        className="px-6 py-2.5 bg-[#0EA5E9] text-white font-medium rounded-lg hover:bg-[#0284C7] transition-colors shadow-lg shadow-sky-500/20"
                    >
                        Confirmar e continuar
                    </button>
                </div>
            </div>

        </div>
    );
};

export default PersonalDataStep;
