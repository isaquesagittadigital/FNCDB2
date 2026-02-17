
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
    const startDate = new Date(startDateStr);

    // 1. Calculate End Date (Start Date + Period)
    const endDate = addMonths(startDate, periodMonths);

    // 2. Base Monthly Values
    const monthlyDividend = amount * (rate / 100);
    const monthlyConsultant = amount * (consultantRate / 100);
    const monthlyLeader = amount * (leaderRate / 100);

    // 3. Determine First Payment Date (Client)
    let firstPaymentDate = setDate(startDate, paymentDay);
    if (getDate(startDate) >= paymentDay) {
        firstPaymentDate = addMonths(firstPaymentDate, 1);
    }

    const clientPayments: PaymentInstallment[] = [];

    // Loop through payments until we pass the end date
    let currentPaymentDate = new Date(firstPaymentDate);
    let totalDividend = 0;

    // --- CLIENT PAYMENTS ---

    // 3.1 First Payment (Pro-rata or Full)
    // Logic: Calculate days from Start Date to First Payment Date
    // Note: The example uses 30-day base for value calculations: (Value / 30) * Days
    const daysFirstPeriod = differenceInCalendarDays(currentPaymentDate, startDate);

    // Special handling for the very first payment if it's pro-rata
    // If exact month difference, it might be treated as full, but usually start dates are mid-month.
    // We use the exact days diff for now, as requested "22 days" logic.
    let firstPaymentAmount = monthlyDividend;
    let isProRataAttr = false;

    // If the first period is not roughly 30 days (allow margin 28-31), treat as pro-rata?
    // Actually, usually Pro-rata is strictly (Monthly / 30) * Days
    if (daysFirstPeriod !== 30) {
        firstPaymentAmount = (monthlyDividend / 30) * daysFirstPeriod;
        isProRataAttr = true;
    }

    clientPayments.push({
        date: format(currentPaymentDate, 'yyyy-MM-dd'),
        amount: firstPaymentAmount,
        type: isProRataAttr ? 'Pro-rata' : 'Dividend',
        description: isProRataAttr ? `Pro-rata (${daysFirstPeriod} dias)` : 'Mensal'
    });
    totalDividend += firstPaymentAmount;

    // 3.2 Middle Payments
    // Move to next month
    currentPaymentDate = addMonths(currentPaymentDate, 1);

    // Generate subsequent monthly payments while strictly BEFORE the month of End Date
    // Strategy: Add full payments until the next payment would be AFTER endDate
    // Wait, the logic is: Pay on day X. If End Date is 16/08 and Payment is 10/08.
    // 10/08 is a full payment (covering 10/07 to 10/08).
    // Then there is a residual from 10/08 to 16/08.

    while (currentPaymentDate <= endDate) {
        // Check if this payment date matches the End Date exactly? Unlikely.
        // Standard monthly payment
        clientPayments.push({
            date: format(currentPaymentDate, 'yyyy-MM-dd'),
            amount: monthlyDividend,
            type: 'Dividend',
            description: 'Mensal'
        });
        totalDividend += monthlyDividend;
        currentPaymentDate = addMonths(currentPaymentDate, 1);
    }

    // 3.3 Final Pro-rata
    // Calculate remaining days from Last Payment to End Date
    const lastFullPaymentDate = addMonths(currentPaymentDate, -1);
    const daysFinalPeriod = differenceInCalendarDays(endDate, lastFullPaymentDate);

    if (daysFinalPeriod > 0) {
        const finalProRataAmount = (monthlyDividend / 30) * daysFinalPeriod;
        clientPayments.push({
            date: format(endDate, 'yyyy-MM-dd'), // Usually paid on end date? Or next 10th?
            // The example says: "Após os 6 pagamentos, restam 8 dias até o dia 10".
            // In the table it shows: "10/09/2026 - R$ 246,67".
            // This implies the final pro-rata is paid on the NEXT payment cycle date, OR the capital return date.
            // The example table shows the capital return on the SAME date (10/09).
            // So we set the date to: Next Payment Day.
            amount: finalProRataAmount,
            type: 'Pro-rata',
            description: `Pro-rata Final (${daysFinalPeriod} dias)`
        });
        totalDividend += finalProRataAmount;
    }

    // 3.4 Capital Return
    // The example shows Capital Return on the same day as the final pro-rata payment (10/09).
    // If daysFinalPeriod was 0, it would be the endDate?
    // Let's assume Capital Return is on the final payment date calculated above (or endDate if no residual).
    const capitalReturnDate = daysFinalPeriod > 0 ? getNextPaymentDate(lastFullPaymentDate, paymentDay) : endDate;

    clientPayments.push({
        date: format(capitalReturnDate, 'yyyy-MM-dd'),
        amount: amount,
        type: 'Capital Return',
        description: 'Devolução de Capital'
    });

    // --- CONSULTANT & LEADER COMMISSIONS ---
    // Rules: 
    // - Consultants receive on day 01.
    // - "Comissão mensal... Não recebe sobre pro rata final".
    // - Leader: "Durante 6 meses".
    // This implies they align with the FULL months of the contract.

    const consultantCommissions: PaymentInstallment[] = [];
    const leaderCommissions: PaymentInstallment[] = [];

    // Logic: Iterate for `periodMonths`, starting from next month's 1st?
    // Example: Start 16/02. First commission 01/03.
    // Wait, 01/03 is only 13 days after start. Is it full commission?
    // Example says: "Comissão mensal do consultor: R$ 75,00".
    // If strict pro-rata isn't applied to commissions (as per "Não recebe sobre pro rata final, salvo regra diferente"),
    // we likely stick to strict Monthly fixed commissions for the duration.

    let commissionDate = setDate(addMonths(startDate, 1), 1); // 1st of next month

    // Determine how many recurring commissions to pay.
    // Usually matches `periodMonths` (e.g., 6 months -> 6 commissions).
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

        commissionDate = addMonths(commissionDate, 1);
    }

    return {
        summary: {
            monthlyDividend,
            totalDividend,
            yieldTotal: (totalDividend / amount) * 100,
            firstPaymentDate: clientPayments[0]?.date || '-',
            lastPaymentDate: clientPayments[clientPayments.length - 1]?.date || '-',
            endDate: format(endDate, 'yyyy-MM-dd')
        },
        clientPayments,
        consultantCommissions,
        leaderCommissions
    };
};

// Helper: Get next occurrence of payment day
const getNextPaymentDate = (from: Date, day: number): Date => {
    let next = setDate(from, day);
    if (next <= from) {
        next = addMonths(next, 1);
    }
    return next;
};
