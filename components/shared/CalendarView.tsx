
import React, { useState, useEffect, useCallback } from 'react';
import { Home, ChevronLeft, ChevronRight, X, Wallet } from 'lucide-react';

interface CalendarPayment {
  id: string;
  contrato_id: string;
  cliente_id: string;
  consultor_id?: string;
  data: string;
  valor: number;
  evento?: string;
  dividendos_clientes?: boolean;
  comissao_consultor?: boolean;
  comissao_consultor_lider?: boolean;
  pago?: boolean;
}

interface CalendarViewProps {
  role?: 'admin' | 'consultant' | 'client';
  userId?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ role = 'admin', userId }) => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [payments, setPayments] = useState<CalendarPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<CalendarPayment | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('month', String(currentMonth + 1)); // API expects 1-based
      params.append('year', String(currentYear));

      if (role === 'consultant' && userId) {
        params.append('consultor_id', userId);
      } else if (role === 'client' && userId) {
        params.append('cliente_id', userId);
      }
      // admin: no filter, gets all

      const res = await fetch(`${apiUrl}/admin/calendar-payments?${params.toString()}`);
      if (res.ok) {
        let data = await res.json();
        // For client role, only show their dividends (hide commissions)
        if (role === 'client') {
          data = data.filter((p: CalendarPayment) => p.dividendos_clientes === true);
        }
        setPayments(data);
      } else {
        console.error('Failed to fetch calendar payments');
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching calendar payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, role, userId, apiUrl]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: { day: number; currentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = currentMonth === 0 ? 12 : currentMonth;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({
      day: d,
      currentMonth: false,
      dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      currentMonth: true,
      dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Next month padding (to fill 6 rows)
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  const remaining = totalCells - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = currentMonth === 11 ? 1 : currentMonth + 2;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({
      day: d,
      currentMonth: false,
      dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Group payments by date
  const paymentsByDate: Record<string, CalendarPayment[]> = {};
  payments.forEach(p => {
    const dateKey = p.data?.substring(0, 10); // YYYY-MM-DD
    if (dateKey) {
      if (!paymentsByDate[dateKey]) paymentsByDate[dateKey] = [];
      paymentsByDate[dateKey].push(p);
    }
  });

  // Get payment tag colors
  const getPaymentColor = (p: CalendarPayment) => {
    if (p.dividendos_clientes) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
    if (p.comissao_consultor) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    if (p.comissao_consultor_lider) return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
    return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' };
  };

  const getPaymentLabel = (p: CalendarPayment) => {
    if (p.evento) return p.evento;
    if (p.dividendos_clientes) return 'Dividendos';
    if (p.comissao_consultor) return 'Comissão';
    if (p.comissao_consultor_lider) return 'Comissão Líder';
    return 'Pagamento';
  };

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  };

  const getDayOfWeekName = (dateStr: string) => {
    const fullNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const d = new Date(dateStr + 'T12:00:00');
    return fullNames[d.getDay()];
  };

  const formatDateLong = (dateStr: string) => {
    const parts = dateStr.substring(0, 10).split('-');
    const day = parseInt(parts[2]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[0]);
    return `${String(day).padStart(2, '0')} de ${monthNames[month].charAt(0).toUpperCase() + monthNames[month].slice(1)}, de ${year}`;
  };

  // Check if a day is today
  const isToday = (day: number, isCurrent: boolean) => {
    return isCurrent && day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // Selected day payments
  const selectedDateStr = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedPayments = selectedDateStr ? (paymentsByDate[selectedDateStr] || []) : [];

  // Summary
  const totalMonth = payments.reduce((sum, p) => sum + (p.valor || 0), 0);
  const dividendosCount = payments.filter(p => p.dividendos_clientes).length;
  const comissoesCount = payments.filter(p => p.comissao_consultor || p.comissao_consultor_lider).length;
  const isClient = role === 'client';

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-[#00A3B1] font-bold">Calendário</span>
      </div>

      {/* Header Controls */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#002B49]">Calendário</h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-1.5 bg-[#64748B] text-white text-xs font-bold rounded hover:bg-slate-600 transition-colors shadow-sm"
            >
              Hoje
            </button>
            <div className="flex border border-slate-200 rounded overflow-hidden shadow-sm">
              <button
                onClick={goToPrevMonth}
                className="px-3 py-1.5 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors border-r border-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNextMonth}
                className="px-3 py-1.5 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="text-sm sm:text-lg text-[#002B49] font-medium capitalize">
              {monthNames[currentMonth]} de {currentYear}
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {loading ? (
              <span className="text-xs text-slate-400 animate-pulse">Carregando...</span>
            ) : (
              <>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium border border-emerald-200">
                  {dividendosCount} dividendos
                </span>
                {!isClient && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">
                    {comissoesCount} comissões
                  </span>
                )}
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold border border-slate-200">
                  Total: {formatCurrency(totalMonth)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-bold text-[#64748B] border-r last:border-r-0 border-slate-200">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => {
            const dayPayments = cell.currentMonth ? (paymentsByDate[cell.dateStr] || []) : [];
            const hasPayments = dayPayments.length > 0;
            const isTodayCell = isToday(cell.day, cell.currentMonth);
            const isSelected = cell.currentMonth && cell.day === selectedDay;

            return (
              <div
                key={idx}
                onClick={() => cell.currentMonth && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                className={`min-h-[60px] sm:min-h-[110px] p-1 sm:p-1.5 border-b border-r last:border-r-0 border-slate-100 group transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' :
                  isTodayCell ? 'bg-amber-50' :
                    hasPayments ? 'bg-slate-50/60' :
                      'bg-white hover:bg-slate-50'
                  }`}
              >
                <div className={`text-right text-[11px] font-bold mb-1 ${isTodayCell ? 'text-white' :
                  cell.currentMonth ? 'text-[#002B49]' : 'text-slate-300'
                  }`}>
                  {isTodayCell ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00A3B1] text-white text-[11px] font-bold">
                      {cell.day}
                    </span>
                  ) : cell.day}
                </div>
                {/* Payment tags */}
                {dayPayments.slice(0, 2).map((p, i) => {
                  const colors = getPaymentColor(p);
                  return (
                    <div
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedPayment(p); }}
                      className={`text-[9px] truncate px-1.5 py-0.5 rounded mb-0.5 border font-medium cursor-pointer hover:opacity-80 transition-opacity ${colors.bg} ${colors.text} ${colors.border}`}
                      title={`${getPaymentLabel(p)}: ${formatCurrency(p.valor)}`}
                    >
                      {getPaymentLabel(p)}
                    </div>
                  );
                })}
                {dayPayments.length > 2 && (
                  <div className="text-[9px] text-slate-400 font-medium px-1">
                    +{dayPayments.length - 2} mais
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-[#002B49] mb-3">
            Pagamentos em {selectedDay} de {monthNames[currentMonth]} de {currentYear}
          </h3>
          {selectedPayments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Nenhum pagamento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {selectedPayments.map((p, i) => {
                const colors = getPaymentColor(p);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.dividendos_clientes ? 'bg-emerald-500' :
                        p.comissao_consultor ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`} />
                      <div>
                        <p className={`text-sm font-medium ${colors.text}`}>{getPaymentLabel(p)}</p>
                        <p className="text-[11px] text-slate-400">
                          {p.pago ? '✅ Pago' : '⏳ Pendente'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {formatCurrency(p.valor)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <span className="text-sm font-bold text-[#002B49]">
                  Total do dia: {formatCurrency(selectedPayments.reduce((s, p) => s + (p.valor || 0), 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" />
          <span>Dividendos Cliente</span>
        </div>
        {!isClient && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
              <span>Comissão Consultor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300" />
              <span>Comissão Líder</span>
            </div>
          </>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A3B1]/10 flex items-center justify-center">
                  <Wallet size={20} className="text-[#00A3B1]" />
                </div>
                <h3 className="text-lg font-bold text-[#002B49]">Pagamento</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-5 pb-5">
              <p className="text-sm text-slate-500 mb-1">
                {getPaymentLabel(selectedPayment)} -
              </p>
              <p className="text-sm text-[#002B49] leading-relaxed">
                O pagamento do dia <strong>{formatDateLong(selectedPayment.data)}</strong>,{' '}
                {getDayOfWeekName(selectedPayment.data)} é de{' '}
                <strong>{formatCurrency(selectedPayment.valor)}</strong>
              </p>

              {/* Close button */}
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full mt-6 py-3 bg-[#00A3B1] text-white font-bold rounded-lg hover:bg-[#008a96] transition-colors shadow-md text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
