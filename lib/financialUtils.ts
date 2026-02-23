
import { addMonths, differenceInCalendarDays, format, getDate, parseISO, setDate } from 'date-fns';

export interface ContractSimulation {
    summary: {
        monthlyDividend: number;
        totalDividend: number;
        yieldTotal: number;
        firstPaymentDate: string;
        lastPaymentDate: string;
        endDate: string;
    };
    clientPayments: PaymentInstallment[];
    consultantCommissions: PaymentInstallment[];
    leaderCommissions: PaymentInstallment[];
}

export interface PaymentInstallment {
    date: string;
    amount: number;
    type: 'Dividend' | 'Pro-rata' | 'Capital Return' | 'Commission';
    description: string;
}

/**
 * Calculates the contract payment schedule based on user rules.
 * @param amount - Initial investment amount (e.g., 50000)
 * @param rate - Monthly interest rate in percentage (e.g., 1.85)
 * @param startDateStr - Contract start date (YYYY-MM-DD or ISO)
 * @param periodMonths - Duration in months (e.g., 6)
 * @param paymentDay - Day of month for client payments (default 10)
 * @param consultantRate - Consultant's commission rate difference (e.g., 0.15)
 * @param leaderRate - Leader's commission rate (e.g., 0.10)
 */
export const calculateContractProjection = (
    amount: number,
    rate: number,
    startDateStr: string,
    periodMonths: number,
    paymentDay: number = 10,
    consultantRate: number = 0,
    leaderRate: number = 0
): ContractSimulation => {
    const clientPayments: PaymentInstallment[] = [];

    // Fix timezone constraints by assuming 00:00:00
    const start = new Date(startDateStr.includes('T') ? startDateStr.split('T')[0] + 'T00:00:00' : startDateStr + 'T00:00:00');
    const dailyRate = (amount * (rate / 100)) / 30;

    // 1. Calculate first payment date (10th of next month)
    let firstPaymentDate = new Date(start.getFullYear(), start.getMonth() + 1, paymentDay);

    // Calculate days for first parcel
    const timeDiff = firstPaymentDate.getTime() - start.getTime();
    const daysFirstParcel = Math.ceil(timeDiff / (1000 * 3600 * 24));

    clientPayments.push({
        date: format(firstPaymentDate, 'yyyy-MM-dd'),
        amount: daysFirstParcel * dailyRate,
        type: daysFirstParcel === 30 ? 'Dividend' : 'Pro-rata',
        description: daysFirstParcel === 30 ? 'Mensal' : `Pro-rata (${daysFirstParcel} dias)`
    });

    let totalDividend = daysFirstParcel * dailyRate;

    // 2. Middle parcels (Full months)
    let lastPaymentDate = firstPaymentDate;
    for (let i = 2; i < periodMonths; i++) {
        const nextPayment = new Date(lastPaymentDate.getFullYear(), lastPaymentDate.getMonth() + 1, paymentDay);
        clientPayments.push({
            date: format(nextPayment, 'yyyy-MM-dd'),
            amount: 30 * dailyRate,
            type: 'Dividend',
            description: 'Mensal'
        });
        totalDividend += 30 * dailyRate;
        lastPaymentDate = nextPayment;
    }

    // 3. Last parcel calculations
    const endDate = new Date(start.getFullYear(), start.getMonth() + periodMonths, start.getDate());
    if (periodMonths > 1) {
        const paymentDayOnLastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), paymentDay);

        if (endDate.getDate() > paymentDay && paymentDayOnLastMonth > lastPaymentDate) {
            clientPayments.push({
                date: format(paymentDayOnLastMonth, 'yyyy-MM-dd'),
                amount: 30 * dailyRate,
                type: 'Dividend',
                description: 'Mensal'
            });
            totalDividend += 30 * dailyRate;

            const timeDiffEnd = endDate.getTime() - paymentDayOnLastMonth.getTime();
            const daysLastParcel = Math.ceil(timeDiffEnd / (1000 * 3600 * 24));

            if (daysLastParcel > 0) {
                clientPayments.push({
                    date: format(endDate, 'yyyy-MM-dd'),
                    amount: daysLastParcel * dailyRate,
                    type: 'Pro-rata',
                    description: `Pro-rata (${daysLastParcel} dias)`
                });
                totalDividend += daysLastParcel * dailyRate;
            }
        } else {
            const timeDiffEnd = endDate.getTime() - lastPaymentDate.getTime();
            const daysLastParcel = Math.ceil(timeDiffEnd / (1000 * 3600 * 24));

            if (daysLastParcel > 0) {
                clientPayments.push({
                    date: format(endDate, 'yyyy-MM-dd'),
                    amount: daysLastParcel * dailyRate,
                    type: 'Pro-rata',
                    description: `Pro-rata (${daysLastParcel} dias)`
                });
                totalDividend += daysLastParcel * dailyRate;
            }
        }
    }

    // 4. Return of capital
    clientPayments.push({
        date: format(endDate, 'yyyy-MM-dd'),
        amount: amount,
        type: 'Capital Return',
        description: 'Valor do aporte'
    });

    // --- CONSULTANT & LEADER COMMISSIONS ---
    const consultantCommissions: PaymentInstallment[] = [];
    const leaderCommissions: PaymentInstallment[] = [];
    const monthlyConsultant = amount * (consultantRate / 100);
    const monthlyLeader = amount * (leaderRate / 100);

    let commissionDate = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    for (let i = 0; i < periodMonths; i++) {
        const dateStr = format(commissionDate, 'yyyy-MM-dd');

        if (monthlyConsultant > 0) {
            consultantCommissions.push({
                date: dateStr,
                amount: monthlyConsultant,
                type: 'Commission',
                description: `Comissão ${i + 1}/${periodMonths}`
            });
        }
        if (monthlyLeader > 0) {
            leaderCommissions.push({
                date: dateStr,
                amount: monthlyLeader,
                type: 'Commission',
                description: `Comissão Lider ${i + 1}/${periodMonths}`
            });
        }
        commissionDate = new Date(commissionDate.getFullYear(), commissionDate.getMonth() + 1, 1);
    }

    return {
        summary: {
            monthlyDividend: 30 * dailyRate,
            totalDividend,
            yieldTotal: (totalDividend / amount) * 100,
            firstPaymentDate: format(firstPaymentDate, 'yyyy-MM-dd'),
            lastPaymentDate: format(lastPaymentDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
        },
        clientPayments,
        consultantCommissions,
        leaderCommissions
    };
};
