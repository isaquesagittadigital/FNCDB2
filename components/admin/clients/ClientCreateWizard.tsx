
import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, User, MapPin, CreditCard, FileText, Send } from 'lucide-react';
import ClientGeneralForm from './tabs/ClientGeneralForm';
import ClientAddressForm from './tabs/ClientAddressForm';
import ClientBankForm from './tabs/ClientBankForm';
import ClientReviewStep from './wizard/ClientReviewStep';

interface ClientCreateWizardProps {
    onBack: () => void;
    onSuccess: () => void;
}

const steps = [
    { id: 'general', label: 'Dados Gerais', icon: User },
    { id: 'address', label: 'Endereço', icon: MapPin },
    { id: 'bank', label: 'Dados Bancários', icon: CreditCard },
    { id: 'review', label: 'Revisão', icon: Check }
];

const ClientCreateWizard: React.FC<ClientCreateWizardProps> = ({ onBack, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Global form state
    const [formData, setFormData] = useState<any>({});

    // IDs created during process
    const [createdClientId, setCreatedClientId] = useState<string | null>(null);

    const handleNext = async (stepData: any) => {
        // Merge data
        setFormData(prev => ({ ...prev, ...stepData }));

        // Logic per step
        if (currentStep === 0) { // General
            // Create user immediately or wait? 
            // User requested: "Advance only if valid". 
            // Usually we create the record on step 1 to have an ID for relations (address/bank).
            // Let's create/upsert the client now.
            await saveGeneralStep(stepData);
            return;
        }

        if (currentStep === 1) { // Address
            // Save address
            await saveAddressStep({ ...formData, ...stepData });
            return;
        }

        // Move next
        setCurrentStep(prev => prev + 1);
    };

    const saveGeneralStep = async (data: any) => {
        setLoading(true);
        try {
            // Include consultant_id if selected (it's in data)
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create client');
            }

            const savedClient = await res.json();
            setCreatedClientId(savedClient.id);
            setFormData(prev => ({ ...prev, ...savedClient })); // Update with ID
            setCurrentStep(prev => prev + 1);
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const saveAddressStep = async (data: any) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/clients/${createdClientId}`, {
                method: 'PUT', // Address is on user table
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save address');
            setCurrentStep(prev => prev + 1);
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep === 0) {
            onBack();
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleFinalize = () => {
        // Show success modal then exit
        if (window.confirm('Cadastro realizado com sucesso!')) {
            onSuccess();
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
            {/* Header / Stepper */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-[#002B49]">Novo Cliente</h1>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-between relative px-10">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10" />
                    {steps.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-4">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                                    ${isActive || isCompleted
                                        ? 'bg-[#002B49] border-[#002B49] text-white'
                                        : 'bg-white border-slate-200 text-slate-300'}
                                `}>
                                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[#002B49]' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-8 flex-1 bg-[#FDFDFD]">
                {currentStep === 0 && (
                    <ClientGeneralForm
                        initialData={formData}
                        onSubmit={handleNext} // Passed as onSubmit, but acts as Next
                        loading={loading}
                        wizardMode={true}
                    />
                )}
                {currentStep === 1 && (
                    <ClientAddressForm
                        initialData={formData}
                        onSubmit={handleNext}
                        loading={loading}
                        wizardMode={true}
                    />
                )}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <ClientBankForm clientId={createdClientId!} />
                        <div className="flex justify-end pt-6 border-t border-slate-100">
                            <button
                                onClick={handleBack}
                                className="mr-auto px-6 py-2.5 text-slate-500 font-medium hover:text-slate-700"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="bg-[#002B49] hover:bg-[#00385D] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2"
                            >
                                Revisar
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
                {currentStep === 3 && (
                    <ClientReviewStep
                        formData={formData}
                        clientId={createdClientId!}
                        onBack={handleBack}
                        onFinalize={handleFinalize}
                    />
                )}
            </div>
        </div>
    );
};

export default ClientCreateWizard;
