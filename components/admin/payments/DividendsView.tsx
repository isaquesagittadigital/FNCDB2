import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ConfirmPaymentModal from './ConfirmPaymentModal';
import { Check, Clock } from 'lucide-react';

interface Payment {
    id: string;
    contrato_id: string;
    user_id?: string;
    data: string;
    valor: number;
    pago: boolean;
    comissao_consultor: boolean;
    comissao_consultor_lider: boolean;
    dividendos_clientes: boolean;
    client_name?: string;
    codigo_contrato?: string;
    consultor_name?: string;
}

const DividendsView: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // Fetch Payments
            const res = await fetch(`${API_URL}/admin/calendar-payments?type=dividendos&month=${selectedMonth}&year=${selectedYear}`);
            if (!res.ok) throw new Error('Falha ao buscar pagamentos');
            let data = await res.json() as Payment[];

            // Fetch Clients to map names
            const { data: clientsData } = await supabase.from('usuarios').select('id, nome_fantasia, razao_social, nome, email').eq('tipo_user', 'Cliente');
            const { data: contractsData } = await supabase.from('contratos').select('id, codigo, user_id, consultor_id');
            const { data: consultantsData } = await supabase.from('usuarios').select('id, nome_fantasia, razao_social, nome, email').eq('tipo_user', 'Consultor');

            data = data.map(payment => {
                const contract = contractsData?.find(c => c.id === payment.contrato_id);
                const clientId = payment.user_id || contract?.user_id;
                const client = clientsData?.find(c => c.id === clientId);
                const consultant = consultantsData?.find(c => c.id === contract?.consultor_id);

                return {
                    ...payment,
                    client_name: client ? (client.nome_fantasia || client.razao_social || client.nome || client.email) : 'Desconhecido',
                    codigo_contrato: contract?.codigo || '-',
                    consultor_name: consultant ? (consultant.nome_fantasia || consultant.nome) : '-'
                };
            });

            setPayments(data);
        } catch (err) {
            console.error('[DividendsView] Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [selectedMonth, selectedYear]);

    const handleConfirmPayment = async () => {
        if (!selectedPayment) return;
        setIsConfirming(true);

        try {
            const res = await fetch(`${API_URL}/admin/calendar-payments/${selectedPayment.id}/pay`, {
                method: 'PATCH'
            });

            if (!res.ok) throw new Error('Falha ao atualizar pagamento');

            // Re-fetch data
            await fetchPayments();
            setIsModalOpen(false);
            setSelectedPayment(null);
        } catch (err) {
            console.error('[DividendsView] Error confirming payment:', err);
            alert('Falha ao confirmar pagamento.');
        } finally {
            setIsConfirming(false);
        }
    };

    const openConfirmModal = (payment: Payment) => {
        if (payment.pago) return;
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const totalGeral = payments.reduce((acc, curr) => acc + curr.valor, 0);
    const totalPago = payments.filter(p => p.pago).reduce((acc, curr) => acc + curr.valor, 0);
    const totalPendente = totalGeral - totalPago;

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#002B49]">Dividendos</h1>
                <div className="flex gap-4">
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="rounded-lg border-gray-300 shadow-sm focus:border-[#009BB6] focus:ring-[#009BB6]"
                    >
                        {months.map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="rounded-lg border-gray-300 shadow-sm focus:border-[#009BB6] focus:ring-[#009BB6]"
                    >
                        {[0, 1, 2, 3, 4].map(offset => {
                            const y = new Date().getFullYear() - 2 + offset;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>
            </div>

            {/* Resumo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">Total Geral</p>
                    <p className="text-2xl font-bold text-[#002B49] mt-2">{formatCurrency(totalGeral)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">Total Pago</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalPago)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">Total Pendente</p>
                    <p className="text-2xl font-bold text-amber-500 mt-2">{formatCurrency(totalPendente)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">Quantidade</p>
                    <p className="text-2xl font-bold text-[#009BB6] mt-2">{payments.length}</p>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                                <th className="p-4 font-medium">Cliente</th>
                                <th className="p-4 font-medium text-center">Data</th>
                                <th className="p-4 font-medium text-center">Status</th>
                                <th className="p-4 font-medium text-center">Contrato</th>
                                <th className="p-4 font-medium text-center">Consultor</th>
                                <th className="p-4 font-medium text-right">Valor</th>
                                <th className="p-4 font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Carregando...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum dividendo encontrado para este mês.</td></tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-[#002B49]">{payment.client_name}</p>
                                        </td>
                                        <td className="p-4 text-center text-slate-600">{formatDate(payment.data)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.pago ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {payment.pago ? 'Pago' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-slate-600">{payment.codigo_contrato}</td>
                                        <td className="p-4 text-center text-slate-600">{payment.consultor_name}</td>
                                        <td className="p-4 text-right font-medium text-[#002B49]">
                                            {formatCurrency(payment.valor)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openConfirmModal(payment)}
                                                disabled={payment.pago}
                                                className={`p-2 rounded-lg transition-colors ${payment.pago ? 'text-emerald-400 bg-emerald-50 cursor-not-allowed' : 'text-[#009BB6] bg-[#009BB6]/10 hover:bg-[#009BB6]/20'}`}
                                                title={payment.pago ? "Pagamento já realizado" : "Confirmar pagamento"}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPayment}
                paymentInfo={selectedPayment ? {
                    name: selectedPayment.client_name || 'Desconhecido',
                    amount: selectedPayment.valor
                } : null}
                isLoading={isConfirming}
            />
        </div>
    );
};

export default DividendsView;
