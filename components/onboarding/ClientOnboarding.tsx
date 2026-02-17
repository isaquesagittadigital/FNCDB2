
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ArrowRight, Edit, ArrowLeft, User, LogOut, ChevronDown } from 'lucide-react';
import PersonalDataStep from './steps/PersonalDataStep';
import AddressStep from './steps/AddressStep';
import ComplianceStep from './steps/ComplianceStep';
import SuitabilityStep from './steps/SuitabilityStep';
import EssentialTermsStep from './steps/EssentialTermsStep';
import RiskAcknowledgmentStep from './steps/RiskAcknowledgmentStep';
import PrivacyStep from './steps/PrivacyStep';
import ReviewStep from './steps/ReviewStep';
import VerificationStep from './steps/VerificationStep';
import FinalContractStep from './steps/FinalContractStep';

const steps = [
    { id: 'dados-cadastrais', label: 'Dados cadastrais' },
    { id: 'endereco-bancarios', label: 'Endereço e dados bancários' },
    { id: 'compliance', label: 'Compliance KYC/KYB e Sanções' },
    { id: 'suitability', label: 'Suitability' },
    { id: 'termos-essenciais', label: 'Termos essenciais da Série' },
    { id: 'termo-ciencia', label: 'Termo de ciência de riscos' },
    { id: 'privacidade', label: 'Privacidade e proteção de dados' },
    { id: 'revisao', label: 'Revisão e aceite' },
    { id: 'contrato-final', label: 'Emissão do Contrato' },
];


interface ClientOnboardingProps {
    onFinish?: () => void;
}


import { LogoIcon } from '../shared/ui/Logo';
import { LoadingScreen } from '../shared/ui/LoadingScreen';
import { supabase } from '../../lib/supabase';

const ClientOnboarding: React.FC<ClientOnboardingProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isUserMenuOpen && !target.closest('.user-menu-container')) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Minimum loading time for initial fetch as well
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 1500));
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Fetch bank accounts (assuming one main account for now)
                const { data: bankAccounts } = await supabase
                    .from('contas_bancarias')
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1);

                // Fetch Onboarding Data
                const { data: onboardingData } = await supabase
                    .from('user_onboarding')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                setFormData({
                    ...profile,
                    logradouro: profile.logradouro_end,
                    numero: profile.numero_end,
                    complemento: profile.complemento_end,
                    ...onboardingData, // Merge onboarding specific fields
                    resource_origin: typeof onboardingData?.resource_origin === 'string'
                        ? JSON.parse(onboardingData.resource_origin)
                        : (onboardingData?.resource_origin || []),
                    experience_areas: typeof onboardingData?.experience_areas === 'string'
                        ? JSON.parse(onboardingData.experience_areas)
                        : (onboardingData?.experience_areas || []),
                    email: profile.email || user.email, // Prefer profile email if updated
                    bankAccount: bankAccounts?.[0] || {}
                });
            }
            await minTimePromise;
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateData = (newData: any) => {
        setFormData((prev: any) => ({ ...prev, ...newData }));
    };

    const saveData = async (step?: number, dataOverride?: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Use current state combined with any overrides
            const currentData = { ...formData, ...dataOverride };

            // 1. Update User Data (Personal + Address) in 'usuarios'
            const userData = {
                nome_fantasia: currentData.nome_fantasia,
                cpf: currentData.cpf?.replace(/\D/g, ''),
                data_nascimento: currentData.data_nascimento,
                nacionalidade: currentData.nacionalidade,
                celular: currentData.celular?.replace(/\D/g, ''),
                email: currentData.email, // Ensure email is updated in usuarios
                profissao: currentData.profissao,
                rg: currentData.rg,
                orgao_emissor: currentData.orgao_emissor,
                uf_rg: currentData.uf_rg,
                estado_civil: currentData.estado_civil,
                logradouro_end: currentData.logradouro,
                numero_end: currentData.numero,
                complemento_end: currentData.complemento,
                bairro: currentData.bairro,
                cidade: currentData.cidade,
                uf: currentData.uf,
                cep: currentData.cep?.replace(/\D/g, '')
            };

            const { error: userError } = await supabase
                .from('usuarios')
                .update(userData)
                .eq('id', user.id);

            if (userError) console.error('Error updating usuario:', userError);

            // 2. Update Bank Account in 'contas_bancarias'
            if (currentData.bankAccount) {
                const bankData = {
                    banco: currentData.bankAccount.banco,
                    agencia: currentData.bankAccount.agencia,
                    digito_agencia: currentData.bankAccount.digito_agencia, // New field
                    conta: currentData.bankAccount.conta,
                    digito_conta: currentData.bankAccount.digito_conta, // New field
                    tipo_conta: currentData.bankAccount.tipo_conta,
                    titular: currentData.bankAccount.titular,
                    cpf_cnpj: currentData.bankAccount.cpf_titular?.replace(/\D/g, ''), // Map to correct column name
                    user_id: user.id
                };

                if (currentData.bankAccount.id) {
                    await supabase
                        .from('contas_bancarias')
                        .update(bankData)
                        .eq('id', currentData.bankAccount.id);
                } else {
                    const { data: newBank } = await supabase
                        .from('contas_bancarias')
                        .insert([bankData])
                        .select()
                        .single();

                    if (newBank) {
                        setFormData((prev: any) => ({ ...prev, bankAccount: { ...prev.bankAccount, id: newBank.id } }));
                    }
                }
            }

            // 3. Update Onboarding Data in 'user_onboarding'
            const onboardingFields = {
                user_id: user.id,
                logradouro_correspondencia: currentData.logradouro_correspondencia,
                numero_correspondencia: currentData.numero_correspondencia,
                complemento_correspondencia: currentData.complemento_correspondencia,
                bairro_correspondencia: currentData.bairro_correspondencia,
                cidade_correspondencia: currentData.cidade_correspondencia,
                uf_correspondencia: currentData.uf_correspondencia,
                cep_correspondencia: currentData.cep_correspondencia?.replace(/\D/g, ''),
                pep_status: currentData.pep_status,
                pep_details: currentData.pep_details,
                resource_origin: currentData.resource_origin,
                resource_origin_other: currentData.resource_origin_other, // New field to save
                resource_proof_available: currentData.resource_proof_available,
                resource_proof_details: currentData.resource_proof_details,
                international_tax_residency: currentData.international_tax_residency,
                international_tax_countries: currentData.international_tax_countries,
                investment_horizon: currentData.investment_horizon,
                lockup_tolerance: currentData.lockup_tolerance,
                liquidity_tolerance: currentData.liquidity_tolerance,
                experience_level: currentData.experience_level,
                experience_areas: currentData.experience_areas,
                experience_years: currentData.experience_years ? parseInt(currentData.experience_years) : null,
                scp_experience: currentData.scp_experience,
                loss_absorption_capacity: currentData.loss_absorption_capacity,
                patrimony_allocation: currentData.patrimony_allocation,
                investment_objective: currentData.investment_objective,
                terms_licit: currentData.terms_licit,
                terms_authorize: currentData.terms_authorize,
                terms_aware: currentData.terms_aware,
                declaration_truth: currentData.declaration_truth,
                declaration_nda: currentData.declaration_nda,
                declaration_adhesion: currentData.declaration_adhesion,
                terms_accepted: currentData.terms_accepted,
                risk_data_truth: currentData.risk_data_truth,
                risk_nda_read: currentData.risk_nda_read,
                risk_adhesion_bind: currentData.risk_adhesion_bind,
                risk_calendar_aware: currentData.risk_calendar_aware,
                risk_acknowledged: currentData.risk_acknowledged,
                risk_acknowledged_at: currentData.risk_acknowledged_at,
                privacy_policy_accepted: currentData.privacy_policy_accepted,
                marketing_consent: currentData.marketing_consent,
                data_verification_consent: currentData.data_verification_consent,
                validation_token: currentData.validation_token,
                validation_timestamp: currentData.validation_timestamp,
                declarations_accepted_at: currentData.declarations_accepted_at,
                ip_address: currentData.ip_address,
                suitability_profile: currentData.suitability_profile, // Persist calculated profile
                current_step: step ?? currentStep,
                updated_at: new Date().toISOString()
            };

            const { error: onboardingError } = await supabase
                .from('user_onboarding')
                .upsert(onboardingFields, { onConflict: 'user_id' });

            if (onboardingError) console.error('Error updating user_onboarding:', onboardingError);

            // Also update local state if override was provided
            if (dataOverride) {
                setFormData((prev: any) => ({ ...prev, ...dataOverride }));
            }

        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleFinish = async (dataOverride?: any) => {
        try {
            setLoading(true);
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000)); // Longer for finish
            await saveData(undefined, dataOverride);

            // Mark onboarding as finalized in 'usuarios'
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('usuarios')
                    .update({ onboarding_finalizado: true })
                    .eq('id', user.id);

                // Notify Consultant and Admins
                try {
                    // 1. Find Consultant
                    const { data: consultantLink } = await supabase
                        .from('meu_consultor')
                        .select('consultor_id')
                        .eq('cliente_id', user.id)
                        .single();

                    // 2. Insert notifications
                    const notifications = [];

                    // For Consultant
                    if (consultantLink && consultantLink.consultor_id) {
                        notifications.push({
                            user_id: consultantLink.consultor_id,
                            type: 'Sistema',
                            title: 'Cliente Finalizou Onboarding',
                            content: `O cliente ${formData.nome_fantasia || 'Novo Cliente'} finalizou o processo de onboarding.`,
                            is_read: false
                        });
                    }

                    // For Admins
                    const { data: admins } = await supabase
                        .from('usuarios')
                        .select('id')
                        .eq('tipo_user', 'Admin');

                    if (admins && admins.length > 0) {
                        admins.forEach(admin => {
                            notifications.push({
                                user_id: admin.id,
                                type: 'Sistema',
                                title: 'Novo Cliente Onboarding Completo',
                                content: `O cliente ${formData.nome_fantasia || 'Novo Cliente'} finalizou o processo de onboarding.`,
                                is_read: false
                            });
                        });
                    }

                    if (notifications.length > 0) {
                        await supabase.from('notificacoes').insert(notifications);
                    }
                } catch (notifError) {
                    console.error("Error creating notifications:", notifError);
                }
            }

            await minTimePromise;
            setIsCompleted(true);
            if (onFinish) onFinish();
        } catch (error) {
            console.error('Error finishing onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async (dataOverride?: any) => {
        if (currentStep < steps.length - 1) {
            try {
                setLoading(true);
                const nextStep = currentStep + 1;
                // Add a minimum delay to show the animation nicely
                const minTimePromise = new Promise(resolve => setTimeout(resolve, 800));

                await Promise.all([saveData(nextStep, dataOverride), minTimePromise]);

                setCurrentStep(nextStep);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error("Error moving to next step", error);
            } finally {
                setLoading(false);
            }
        } else {
            handleFinish(dataOverride);
        }
    };



    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {

        if (isCompleted) return <VerificationStep onFinish={onFinish} />;

        const commonProps = {
            data: formData,
            onUpdate: handleUpdateData,
            onNext: handleNext,
            onBack: handleBack
        };

        switch (currentStep) {
            case 0:
                return <PersonalDataStep {...commonProps} />;
            case 1:
                return <AddressStep {...commonProps} />;
            case 2:
                // @ts-ignore
                return <ComplianceStep {...commonProps} />;
            case 3:
                // @ts-ignore
                return <SuitabilityStep {...commonProps} />;
            case 4:
                // @ts-ignore
                return <EssentialTermsStep {...commonProps} />;
            case 5:
                // @ts-ignore
                return <RiskAcknowledgmentStep {...commonProps} />;
            case 6:
                // @ts-ignore
                return <PrivacyStep {...commonProps} />;
            case 7:
                // @ts-ignore
                return <ReviewStep {...commonProps} onEditStep={setCurrentStep} />;
            case 8:
                // @ts-ignore
                return <FinalContractStep data={formData} onFinish={handleFinish} onBack={handleBack} onUpdate={handleUpdateData} />;
            default:
                return <div>Etapa não encontrada</div>;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with Logo and User Menu */}
                <div className="flex justify-between items-center mb-8">
                    {/* Empty space for alignment */}
                    <div className="w-10"></div>

                    {/* Logo Section - Centered */}
                    <div className="flex justify-center flex-1">
                        <LogoIcon className="w-12 h-12" dark={true} />
                    </div>

                    {/* User Menu - Right */}
                    <div className="relative user-menu-container">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-[#0EA5E9] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {formData?.nome_fantasia?.charAt(0)?.toUpperCase() || <User size={16} />}
                            </div>
                            <ChevronDown size={16} className={`text-slate-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900">{formData?.nome_fantasia || 'Usuário'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{formData?.email || ''}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} className="text-slate-500" />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stepper */}
                {!isCompleted && (
                    <div className="mb-12 overflow-x-auto pb-4">
                        <div className="flex items-center justify-between min-w-[1000px] relative">
                            {/* Progress Line Background */}
                            <div className="absolute top-[14px] left-0 right-0 h-[2px] bg-slate-200 -z-10" />

                            {/* Active Progress Line */}
                            <div
                                className="absolute top-[14px] left-0 h-[2px] bg-[#0EA5E9] -z-10 transition-all duration-500 ease-in-out"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isCompletedStep = index < currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 group cursor-pointer" onClick={() => index < currentStep && setCurrentStep(index)}>
                                        <div
                                            className={`
                        w-7 h-7 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 bg-white
                        ${isActive
                                                    ? 'border-[#0EA5E9] shadow-[0_0_0_4px_rgba(14,165,233,0.1)] scale-110'
                                                    : isCompletedStep
                                                        ? 'bg-[#0EA5E9] border-[#0EA5E9]'
                                                        : 'border-slate-200'
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <div className="w-2.5 h-2.5 bg-[#0EA5E9] rounded-full" />
                                            )}
                                            {isCompletedStep && (
                                                <Check size={14} className="text-white stroke-[3]" />
                                            )}
                                        </div>
                                        <span
                                            className={`
                        text-[11px] font-semibold text-center max-w-[100px] leading-tight transition-colors duration-300
                        ${isActive ? 'text-[#0EA5E9]' : isCompletedStep ? 'text-slate-700' : 'text-slate-400'}
                      `}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-w-3xl mx-auto">
                    {renderStepContent()}
                </div>

            </div>
        </div>
    );
};

export default ClientOnboarding;
