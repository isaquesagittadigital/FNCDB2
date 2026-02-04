import React from 'react';
import { FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "Nenhuma nota encontrada.",
    description = "Cadastre notas fiscais em sua conta para vê-las aqui",
    icon: Icon = FileSearch
}) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-[#E6F6F7] text-[#00A3B1] rounded-full flex items-center justify-center mb-6 shadow-inner"
            >
                <Icon size={32} />
            </motion.div>

            <h3 className="text-lg font-bold text-[#002B49] mb-2">
                {title}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default EmptyState;
