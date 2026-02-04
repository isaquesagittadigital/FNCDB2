
import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { Field, FormSection } from '../ui/FormElements';
import SuccessModal from '../modals/SuccessModal';
import DataUpdateModal from '../modals/DataUpdateModal';
import { api } from '../../../services/api';

interface GeneralDataTabProps {
    userProfile: any;
    onUpdate: (data: any) => Promise<void>;
    saving: boolean;
    readOnly?: boolean;
}

const GeneralDataTab: React.FC<GeneralDataTabProps> = ({ userProfile, onUpdate, saving, readOnly }) => {
    const [formData, setFormData] = useState(userProfile);
    const [searchingCnpj, setSearchingCnpj] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => { setFormData(userProfile); }, [userProfile]);

    const updateForm = (key: string, val: any) => setFormData((prev: any) => ({ ...prev, [key]: val }));

    const handleSearchCnpj = async () => {
        if (!formData.cnpj) return;
        setSearchingCnpj(true);
        const data = await api.getCnpj(formData.cnpj);
        setSearchingCnpj(false);

        if (data) {
            setFormData((prev: any) => ({
                ...prev,
                razao_social: data.razao_social,
                nome_fantasia: data.nome_fantasia,
                data_fundacao: data.data_inicio_atividade,
                logradouro_end: data.logradouro,
                numero_end: data.numero,
                complemento_end: data.complemento,
                bairro: data.bairro,
                cidade: data.municipio,
                uf: data.uf,
                cep: data.cep,
                telefone_principal: data.ddd_telefone_1
            }));
        } else {
            alert("CNPJ não encontrado ou erro na busca.");
        }
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.cnpj || !formData.razao_social || !formData.email) {
            alert("Preencha os campos obrigatórios (*).");
            return;
        }

        await onUpdate({
            cnpj: formData.cnpj,
            data_fundacao: formData.data_fundacao,
            nome_fantasia: formData.nome_fantasia,
            razao_social: formData.razao_social,
            email: formData.email, // This might duplicate AccessDataTab but ok
            email_alternativo: formData.email_alternativo,
            celular: formData.celular,
            telefone_principal: formData.telefone_principal,
            telefone_secundario: formData.telefone_secundario,
            cpf_representante: formData.cpf_representante,
            nome_representante: formData.nome_representante
        });
        setShowSuccess(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                description="Dados da empresa atualizados com sucesso."
            />

            <FormSection title="Informações da empresa">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                        label="Documento (CNPJ)"
                        value={formData.cnpj}
                        onChange={(val) => updateForm('cnpj', val)}
                        mask="00.000.000/0000-00"
                        required
                        disabled={readOnly}
                        rightIcon={readOnly ? null : Search}
                        onRightIconClick={handleSearchCnpj}
                    />
                    <Field
                        label="Data de fundação"
                        value={formData.data_fundacao}
                        onChange={(val) => updateForm('data_fundacao', val)}
                        type="date"
                        required
                        disabled={readOnly}
                    />
                </div>

                <Field
                    label="Nome fantasia"
                    value={formData.nome_fantasia}
                    onChange={(val) => updateForm('nome_fantasia', val)}
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Razão social"
                    value={formData.razao_social}
                    onChange={(val) => updateForm('razao_social', val)}
                    required
                    disabled={readOnly}
                />
            </FormSection>

            <FormSection title="Informações de contato">
                <Field
                    label="Email"
                    value={formData.email}
                    onChange={(val) => updateForm('email', val)}
                    icon={Mail}
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Email alternativo"
                    value={formData.email_alternativo}
                    onChange={(val) => updateForm('email_alternativo', val)}
                    placeholder="Opcional"
                    icon={Mail}
                    disabled={readOnly}
                />
                <Field
                    label="Celular"
                    value={formData.celular}
                    onChange={(val) => updateForm('celular', val)}
                    mask="(00) 00000-0000"
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Telefone principal"
                    value={formData.telefone_principal}
                    onChange={(val) => updateForm('telefone_principal', val)}
                    mask="(00) 0000-0000"
                    placeholder="Opcional"
                    disabled={readOnly}
                />
                <Field
                    label="Telefone secundário"
                    value={formData.telefone_secundario}
                    onChange={(val) => updateForm('telefone_secundario', val)}
                    mask="(00) 0000-0000"
                    placeholder="Opcional"
                    disabled={readOnly}
                />
            </FormSection>

            <FormSection title="Representante Legal">
                <Field
                    label="CPF representante legal da empresa"
                    value={formData.cpf_representante}
                    onChange={(val) => updateForm('cpf_representante', val)}
                    mask="000.000.000-00"
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Nome do representante legal da empresa"
                    value={formData.nome_representante}
                    onChange={(val) => updateForm('nome_representante', val)}
                    required
                    disabled={readOnly}
                />
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
                        {saving ? 'Salvando...' : 'Salvar informações'}
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

export default GeneralDataTab;
