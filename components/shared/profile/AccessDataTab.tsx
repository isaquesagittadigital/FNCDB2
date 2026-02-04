
import React, { useState } from 'react';
import { User, Upload, Eye, EyeOff, CheckCircle2, HelpCircle, Mail } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { compressImage } from '../../../utils/image';
import { Field, FormSection } from '../ui/FormElements';
import SuccessModal from '../modals/SuccessModal';
import ConfirmationModal from '../modals/ConfirmationModal';

interface AccessDataTabProps {
    userProfile: any;
    onUpdate: (data: any) => Promise<void>;
    saving: boolean;
    readOnly?: boolean;
}

const AccessDataTab: React.FC<AccessDataTabProps> = ({ userProfile, onUpdate, saving, readOnly }) => {
    // ... existing state items ...
    const [formData, setFormData] = useState({
        nome_fantasia: userProfile.nome_fantasia || userProfile.razao_social || '',
        email: userProfile.email || '',
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
        currentVisible: false,
        newVisible: false,
        confirmVisible: false
    });

    const [modals, setModals] = useState({
        success: false,
        successMessage: '',
        confirmEmail: false
    });

    const updateForm = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        try {
            const file = e.target.files[0];
            const compressedFile = await compressImage(file);

            const fileExt = file.name.split('.').pop();
            const filePath = `${userProfile.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Add cache buster to URL to force reload
            await onUpdate({ foto_perfil: `${publicUrl}?t=${Date.now()}` });

        } catch (error: any) {
            alert('Erro ao enviar imagem: ' + error.message);
        }
    };

    const handleInfoSave = async () => {
        // If email changed, we might want to confirm or handle distinct logic
        // For now, simple update
        await onUpdate({
            nome_fantasia: formData.nome_fantasia,
            email: formData.email
        });
        setModals(prev => ({ ...prev, success: true, successMessage: 'Dados atualizados com sucesso.' }));
    };

    const handlePasswordSave = async () => {
        if (passwords.new !== passwords.confirm) {
            alert("As senhas não coincidem!");
            return;
        }
        if (!passwords.new) return;

        try {
            // Supabase requires logging in again to change password if we want to verify 'current' strictly, 
            // but signInWithPassword handles that check efficiently.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userProfile.email,
                password: passwords.current
            });

            if (signInError) {
                alert("Senha atual incorreta.");
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: passwords.new });
            if (error) throw error;

            setModals(prev => ({ ...prev, success: true, successMessage: 'Senha alterada com sucesso.' }));
            setPasswords({
                current: '', new: '', confirm: '',
                currentVisible: false, newVisible: false, confirmVisible: false
            });

        } catch (error: any) {
            alert("Erro ao alterar senha: " + error.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SuccessModal
                isOpen={modals.success}
                onClose={() => setModals(prev => ({ ...prev, success: false }))}
                description={modals.successMessage}
            />

            <ConfirmationModal
                isOpen={modals.confirmEmail}
                onClose={() => setModals(prev => ({ ...prev, confirmEmail: false }))}
                onConfirm={handleInfoSave}
                title="Confirmar alteração"
                description="Ao alterar o e-mail, seu login de acesso também será modificado. Deseja continuar?"
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-slate-100 pb-8">
                <div className="md:col-span-3 space-y-4">
                    <label className="flex items-center gap-1 text-sm font-bold text-[#002B49]">
                        Foto de perfil<span className="text-[#00A3B1]">*</span>
                        <HelpCircle size={14} className="text-slate-300" />
                    </label>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium max-w-[200px]">
                        A foto deve ser apenas do rosto. Evite fotos de óculos escuro. Tire a foto em local bem iluminado.
                    </p>
                </div>

                <div className="md:col-span-9 flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-slate-100 overflow-hidden shadow-sm">
                        {userProfile.foto_perfil ? (
                            <img src={userProfile.foto_perfil} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-slate-300" size={32} />
                        )}
                    </div>

                    <label className={`flex-1 ${readOnly ? 'cursor-default' : 'cursor-pointer'} group`}>
                        {!readOnly && <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />}
                        <div className={`border border-[#00A3B1] border-dashed rounded-xl h-[80px] bg-[#F8FAFB] flex flex-col items-center justify-center gap-1 ${!readOnly ? 'group-hover:bg-[#E6F6F7]' : ''} transition-all w-full`}>
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <Upload size={12} className="text-[#002B49]" />
                                </div>
                                <span className="text-xs font-bold text-[#00A3B1]">{readOnly ? 'Imagem do Perfil' : 'Clique para carregar'}</span>
                                {!readOnly && <span className="text-xs text-slate-500"> ou arraste e solte</span>}
                            </div>
                            {!readOnly && <span className="text-[10px] text-slate-400">PNG ou JPG (min. 800x400px)</span>}
                        </div>
                    </label>
                </div>
            </div>

            <div className="space-y-6 pt-10">
                <Field
                    label="Nome completo"
                    value={formData.nome_fantasia}
                    onChange={(val) => updateForm('nome_fantasia', val)}
                    required
                    className="w-full"
                    disabled={readOnly}
                />

                <Field
                    label="Email"
                    value={formData.email}
                    onChange={(val) => updateForm('email', val)}
                    required
                    className="w-full"
                    icon={Mail}
                    disabled={readOnly}
                />

                {!readOnly && (
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={() => userProfile.email !== formData.email ? setModals(prev => ({ ...prev, confirmEmail: true })) : handleInfoSave()}
                            disabled={saving}
                            className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all disabled:opacity-50">
                            <CheckCircle2 size={18} />
                            {saving ? 'Salvando...' : 'Salvar informações'}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6 pt-8">
                <h3 className="text-sm font-bold text-[#002B49] tracking-wide">Senha</h3>
                <Field
                    label="Senha atual"
                    value={passwords.current}
                    onChange={(val) => setPasswords({ ...passwords, current: val })}
                    type={passwords.currentVisible ? 'text' : 'password'}
                    rightIcon={passwords.currentVisible ? EyeOff : Eye}
                    onRightIconClick={() => setPasswords({ ...passwords, currentVisible: !passwords.currentVisible })}
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Nova senha"
                    value={passwords.new}
                    onChange={(val) => setPasswords({ ...passwords, new: val })}
                    type={passwords.newVisible ? 'text' : 'password'}
                    rightIcon={passwords.newVisible ? EyeOff : Eye}
                    onRightIconClick={() => setPasswords({ ...passwords, newVisible: !passwords.newVisible })}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={readOnly}
                />
                <Field
                    label="Confirmar nova senha"
                    value={passwords.confirm}
                    onChange={(val) => setPasswords({ ...passwords, confirm: val })}
                    type={passwords.confirmVisible ? 'text' : 'password'}
                    rightIcon={passwords.confirmVisible ? EyeOff : Eye}
                    onRightIconClick={() => setPasswords({ ...passwords, confirmVisible: !passwords.confirmVisible })}
                    required
                    disabled={readOnly}
                />

                {!readOnly && (
                    <>
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 size={14} className={passwords.new.length >= 8 ? "text-[#00A3B1]" : "text-slate-300"} />
                                <span>Deve conter pelo menos 8 caracteres</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 size={14} className={/[!@#$%^&*(),.?":{}|<>]/.test(passwords.new) ? "text-[#00A3B1]" : "text-slate-300"} />
                                <span>Deve conter pelo menos 1 caractere especial</span>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handlePasswordSave}
                                disabled={saving || !passwords.new}
                                className="flex items-center gap-2 bg-[#00A3B1] hover:bg-[#008c99] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A3B1]/20 active:scale-95 transition-all disabled:opacity-50">
                                <CheckCircle2 size={18} />
                                {saving ? 'Salvando...' : 'Salvar senha'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccessDataTab;
