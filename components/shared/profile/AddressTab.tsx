
import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { Field, FormSection } from '../ui/FormElements';
import SuccessModal from '../modals/SuccessModal';
import DataUpdateModal from '../modals/DataUpdateModal';
import { api } from '../../../services/api';

interface AddressTabProps {
    userProfile: any;
    onUpdate: (data: any) => Promise<void>;
    saving: boolean;
    readOnly?: boolean;
}

const AddressTab: React.FC<AddressTabProps> = ({ userProfile, onUpdate, saving, readOnly }) => {
    const [formData, setFormData] = useState(userProfile);
    const [searching, setSearching] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => { setFormData(userProfile); }, [userProfile]);

    const updateForm = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSearchCep = async () => {
        if (!formData.cep) return;
        setSearching(true);
        const data = await api.getCep(formData.cep);
        setSearching(false);

        if (data) {
            setFormData((prev: any) => ({
                ...prev,
                logradouro_end: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                uf: data.uf
            }));
        } else {
            alert("CEP não encontrado.");
        }
    };

    const handleSave = async () => {
        await onUpdate({
            cep: formData.cep,
            logradouro_end: formData.logradouro_end, // Mapping to DB column names
            numero_end: formData.numero_end,
            complemento_end: formData.complemento_end,
            bairro: formData.bairro,
            cidade: formData.cidade,
            uf: formData.uf
        });
        setShowSuccess(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Endereço atualizado com sucesso."
                title="Dados atualizados"
            />

            <FormSection title="Endereço">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <Field
                        label="CEP"
                        value={formData.cep}
                        onChange={(val) => updateForm('cep', val)}
                        mask="00000-000"
                        required
                        className="md:col-span-1"
                        disabled={readOnly}
                    />
                    {!readOnly && (
                        <button
                            onClick={handleSearchCep}
                            disabled={searching}
                            className="w-1/2 flex items-center justify-center gap-2 h-[50px] bg-[#00A3B1] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#008c99] transition-all mb-[1px] shadow-lg shadow-[#00A3B1]/20 border border-transparent">
                            {searching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Buscar CEP
                        </button>
                    )}
                </div>

                <Field label="Endereço" value={formData.logradouro_end} onChange={(val) => updateForm('logradouro_end', val)} required className="md:col-span-1" disabled={readOnly} />
                <Field label="Número" value={formData.numero_end} onChange={(val) => updateForm('numero_end', val)} required className="md:col-span-1" disabled={readOnly} />
                <Field label="Complemento" value={formData.complemento_end} onChange={(val) => updateForm('complemento_end', val)} placeholder="Opcional" className="md:col-span-1" disabled={readOnly} />
                <Field label="Bairro" value={formData.bairro} onChange={(val) => updateForm('bairro', val)} required className="md:col-span-1" disabled={readOnly} />

                <Field label="Cidade" value={formData.cidade} onChange={(val) => updateForm('cidade', val)} required className="md:col-span-1" disabled={readOnly} />
                <div className="space-y-2 md:col-span-1">
                    <label className="text-[11px] font-bold text-[#002B49] uppercase tracking-wider">UF<span className="text-[#00A3B1]">*</span></label>
                    <input
                        value={formData.uf || ''}
                        onChange={(e) => updateForm('uf', e.target.value)}
                        maxLength={2}
                        disabled={readOnly}
                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] disabled:bg-slate-50 disabled:text-slate-400"
                    />
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
                        {saving ? 'Salvando...' : 'Salvar endereço'}
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

export default AddressTab;
