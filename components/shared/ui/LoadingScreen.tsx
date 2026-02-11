import React from 'react';
import { LogoIcon } from './Logo';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-[#F9FAFB] z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
                {/* Logo with pulse animation */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#0EA5E9]/20 rounded-full blur-xl animate-pulse" />
                    <LogoIcon className="w-20 h-20 relative z-10 animate-[bounce_2s_infinite]" dark={true} />
                </div>

                {/* Loading bar */}
                <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0EA5E9] rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '50%' }} />
                </div>

                <p className="mt-4 text-slate-500 text-sm font-medium animate-pulse">
                    Carregando...
                </p>
            </div>

            <style>
                {`
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                `}
            </style>
        </div>
    );
};
