
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { IMaskInput } from 'react-imask';

export const FormSection: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`space-y-6 ${className}`}>
        <h3 className="text-sm font-bold text-[#002B49] tracking-wide">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {children}
        </div>
    </div>
);

export const Field: React.FC<{
    label: string,
    value?: string,
    onChange?: (val: string) => void,
    type?: string,
    placeholder?: string,
    disabled?: boolean,
    required?: boolean,
    icon?: any,
    rightIcon?: any,
    onRightIconClick?: () => void,
    className?: string,
    mask?: string
}> = ({ label, value, onChange, type = 'text', placeholder, disabled, required, icon: Icon, rightIcon: RightIcon, onRightIconClick, className, mask }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="flex items-center gap-1 text-sm font-bold text-[#002B49]">
            {label}{required && <span className="text-[#00A3B1]">*</span>}
            {label && label.includes('Foto de perfil') && <HelpCircle size={14} className="text-slate-300 cursor-help" />}
        </label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#00A3B1] transition-colors">
                    <Icon size={18} />
                </div>
            )}
            {mask ? (
                <IMaskInput
                    mask={mask}
                    value={value || ''}
                    onAccept={(val: any) => onChange && onChange(val)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                />
            ) : (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-11' : 'px-4'} py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-[#002B49] font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/10 focus:border-[#00A3B1] transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                />
            )}

            {RightIcon && (
                <button
                    type="button"
                    onClick={onRightIconClick}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A3B1] transition-colors"
                >
                    <RightIcon size={18} />
                </button>
            )}
        </div>
    </div>
);

export const Toggle: React.FC<{
    label: string,
    description?: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    className?: string
}> = ({ label, description, checked, onChange, className }) => (
    <div className={`flex items-center justify-between py-3 border-b border-slate-100 last:border-0 ${className}`}>
        <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-[#002B49] leading-tight">{label}</h4>
            {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A3B1]/20 focus:ring-offset-2 ${checked ? 'bg-[#3B82F6]' : 'bg-slate-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);
