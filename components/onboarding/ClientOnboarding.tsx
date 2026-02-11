
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ArrowRight, Edit, ArrowLeft } from 'lucide-react';
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

    useEffect(() => {
        fetchUserData();
    }, []);

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

    const saveData = async (step?: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Update User Data (Personal + Address) in 'usuarios'
            const userData = {
                nome_fantasia: formData.nome_fantasia,
                cpf: formData.cpf?.replace(/\D/g, ''),
                data_nascimento: formData.data_nascimento,
                nacionalidade: formData.nacionalidade,
                celular: formData.celular?.replace(/\D/g, ''),
                email: formData.email, // Ensure email is updated in usuarios
                profissao: formData.profissao,
                rg: formData.rg,
                orgao_emissor: formData.orgao_emissor,
                uf_rg: formData.uf_rg,
                estado_civil: formData.estado_civil,
                logradouro_end: formData.logradouro,
                numero_end: formData.numero,
                complemento_end: formData.complemento,
                bairro: formData.bairro,
                cidade: formData.cidade,
                uf: formData.uf,
                cep: formData.cep?.replace(/\D/g, '')
            };

            const { error: userError } = await supabase
                .from('usuarios')
                .update(userData)
                .eq('id', user.id);

            if (userError) console.error('Error updating usuario:', userError);

            // 2. Update Bank Account in 'contas_bancarias'
            if (formData.bankAccount) {
                const bankData = {
                    banco: formData.bankAccount.banco,
                    agencia: formData.bankAccount.agencia,
                    digito_agencia: formData.bankAccount.digito_agencia, // New field
                    conta: formData.bankAccount.conta,
                    digito_conta: formData.bankAccount.digito_conta, // New field
                    tipo_conta: formData.bankAccount.tipo_conta,
                    titular: formData.bankAccount.titular,
                    cpf_cnpj: formData.bankAccount.cpf_titular?.replace(/\D/g, ''), // Map to correct column name
                    user_id: user.id
                };

                if (formData.bankAccount.id) {
                    await supabase
                        .from('contas_bancarias')
                        .update(bankData)
                        .eq('id', formData.bankAccount.id);
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
                logradouro_correspondencia: formData.logradouro_correspondencia,
                numero_correspondencia: formData.numero_correspondencia,
                complemento_correspondencia: formData.complemento_correspondencia,
                bairro_correspondencia: formData.bairro_correspondencia,
                cidade_correspondencia: formData.cidade_correspondencia,
                uf_correspondencia: formData.uf_correspondencia,
                cep_correspondencia: formData.cep_correspondencia?.replace(/\D/g, ''),
                pep_status: formData.pep_status,
                pep_details: formData.pep_details,
                resource_origin: formData.resource_origin,
                resource_origin_other: formData.resource_origin_other, // New field to save
                resource_proof_available: formData.resource_proof_available,
                resource_proof_details: formData.resource_proof_details,
                international_tax_residency: formData.international_tax_residency,
                international_tax_countries: formData.international_tax_countries,
                investment_horizon: formData.investment_horizon,
                lockup_tolerance: formData.lockup_tolerance,
                liquidity_tolerance: formData.liquidity_tolerance,
                experience_level: formData.experience_level,
                experience_areas: formData.experience_areas,
                experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
                scp_experience: formData.scp_experience,
                loss_absorption_capacity: formData.loss_absorption_capacity,
                patrimony_allocation: formData.patrimony_allocation,
                investment_objective: formData.investment_objective,
                terms_licit: formData.terms_licit,
                terms_authorize: formData.terms_authorize,
                terms_aware: formData.terms_aware,
                declaration_truth: formData.declaration_truth,
                declaration_nda: formData.declaration_nda,
                declaration_adhesion: formData.declaration_adhesion,
                terms_accepted: formData.terms_accepted,
                risk_data_truth: formData.risk_data_truth,
                risk_nda_read: formData.risk_nda_read,
                risk_adhesion_bind: formData.risk_adhesion_bind,
                risk_calendar_aware: formData.risk_calendar_aware,
                risk_acknowledged: formData.risk_acknowledged,
                risk_acknowledged_at: formData.risk_acknowledged_at,
                privacy_policy_accepted: formData.privacy_policy_accepted,
                marketing_consent: formData.marketing_consent,
                data_verification_consent: formData.data_verification_consent,
                validation_token: formData.validation_token,
                validation_timestamp: formData.validation_timestamp,
                declarations_accepted_at: formData.declarations_accepted_at,
                suitability_profile: formData.suitability_profile, // Persist calculated profile
                current_step: step ?? currentStep,
                updated_at: new Date().toISOString()
            };

            const { error: onboardingError } = await supabase
                .from('user_onboarding')
                .upsert(onboardingFields, { onConflict: 'user_id' });

            if (onboardingError) console.error('Error updating user_onboarding:', onboardingError);

        } catch (error) {
            console.error('Error saving data:', error);
            throw error;
        }
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000)); // Longer for finish
            await saveData();

            // Mark onboarding as finalized in 'usuarios'
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('usuarios')
                    .update({ onboarding_finalizado: true })
                    .eq('id', user.id);
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

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            try {
                setLoading(true);
                const nextStep = currentStep + 1;
                // Add a minimum delay to show the animation nicely
                const minTimePromise = new Promise(resolve => setTimeout(resolve, 800));

                await Promise.all([saveData(nextStep), minTimePromise]);

                setCurrentStep(nextStep);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error("Error moving to next step", error);
            } finally {
                setLoading(false);
            }
        } else {
            handleFinish();
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
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <LogoIcon className="w-12 h-12" dark={true} />
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
