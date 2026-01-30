
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EvolutionChart: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Consultores');

    // Mock data for the chart
    const data = [
        { month: 'Jan', value: 40 },
        { month: 'Fev', value: 48 },
        { month: 'Mar', value: 30 },
        { month: 'Abr', value: 42 },
        { month: 'Mai', value: 30 },
        { month: 'Jun', value: 46 },
        { month: 'Jul', value: 40 },
        { month: 'Ago', value: 42 },
        { month: 'Set', value: 40 },
        { month: 'Out', value: 0 },
        { month: 'Nov', value: 0 },
        { month: 'Dez', value: 0 },
    ];

    const maxVal = Math.max(...data.map(d => d.value)) || 50;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-[#002B49]">Gráfico de evolução</h3>
                <div className="flex gap-4">
                    {['Consultores', 'Clientes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium pb-1 transition-colors relative ${activeTab === tab ? 'text-[#00A3B1]' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00A3B1]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative h-64 flex items-end justify-between gap-2 sm:gap-4">
                {/* Y-axis labels simplified */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-300 pointer-events-none">
                    <span>50</span>
                    <span>40</span>
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                    <span>0</span>
                </div>

                <div className="flex-1 flex items-end justify-between ml-8 h-full">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 group w-full">
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1A1A1A] text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                {item.value} {activeTab.toLowerCase()}
                            </div>

                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.value / 50) * 100}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={`w-3 sm:w-6 rounded-t-sm transition-colors ${item.value > 0 ? 'bg-[#00A3B1] group-hover:bg-[#008c99]' : 'bg-slate-100'
                                    }`}
                            />

                            {/* X-axis Label */}
                            <span className="text-[10px] sm:text-xs text-slate-400">{item.month}</span>
                        </div>
                    ))}
                </div>

                {/* Y-axis Label */}
                <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] text-slate-400 origin-center whitespace-nowrap">
                    Quantidade
                </div>
            </div>
        </div>
    );
};

export default EvolutionChart;
