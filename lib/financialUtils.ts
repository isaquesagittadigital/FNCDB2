import { addMonths, differenceInCalendarDays, format, getDate, parseISO, setDate } from 'date-fns';

export const getCommercialDays = (date1: Date, date2: Date) => {
    // In commercial logic, full months are 30 days
    // But for the exact difference, we use the spreadsheet logic:
    // If it's pure months, it's (months * 30).
    // If we need exact days for the first piece, we just take the arithmetic calendar difference.

    // We will use standard calendar difference for actual day counts of pro-rata chunks
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

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
    diasProRata?: number;
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
    const consultantCommissions: PaymentInstallment[] = [];
    const leaderCommissions: PaymentInstallment[] = [];

    // Fix timezone constraints by assuming 00:00:00
    const start = new Date(startDateStr.includes('T') ? startDateStr.split('T')[0] + 'T00:00:00' : startDateStr + 'T00:00:00');

    // Client Daily Rate
    const dailyRate = (amount * (rate / 100)) / 30;

    // Consultant Daily Rate
    const consultantDailyRate = (amount * (consultantRate / 100)) / 30;

    // Leader Daily Rate
    const leaderDailyRate = (amount * (leaderRate / 100)) / 30;

    const totalDaysTarget = periodMonths * 30;

    // --- CLIENT PAYMENTS ---

    // 1. Calculate first payment date (target day of next month)
    let firstPaymentDate = new Date(start.getFullYear(), start.getMonth() + 1, paymentDay);

    // Calculate days for first parcel
    const daysFirstParcel = getCommercialDays(start, firstPaymentDate);

    // Safety check just in case date is identical or negative
    const actualDaysFirst = Math.max(0, daysFirstParcel);

    clientPayments.push({
        date: format(firstPaymentDate, 'yyyy-MM-dd'),
        amount: actualDaysFirst * dailyRate,
        type: actualDaysFirst === 30 ? 'Dividend' : 'Pro-rata',
        description: actualDaysFirst === 30 ? 'Mensal' : `Pro-rata (${actualDaysFirst} dias)`,
        diasProRata: actualDaysFirst
    });

    let totalDividend = actualDaysFirst * dailyRate;
    let accumulatedClientDays = actualDaysFirst;

    // 2. Middle parcels (Full months)
    let lastPaymentDate = firstPaymentDate;
    for (let i = 2; i < periodMonths; i++) {
        const nextPayment = new Date(lastPaymentDate.getFullYear(), lastPaymentDate.getMonth() + 1, paymentDay);
        clientPayments.push({
            date: format(nextPayment, 'yyyy-MM-dd'),
            amount: 30 * dailyRate,
            type: 'Dividend',
            description: 'Mensal',
            diasProRata: 0
        });
        totalDividend += 30 * dailyRate;
        accumulatedClientDays += 30;
        lastPaymentDate = nextPayment;
    }

    // 3. Last parcel calculations
    const endDate = new Date(start.getFullYear(), start.getMonth() + periodMonths, start.getDate());

    if (periodMonths > 1) {
        const remainingDays = Math.max(0, totalDaysTarget - accumulatedClientDays);

        // Final Pro Rata Date is the exact end Date
        if (remainingDays > 0 && remainingDays < 30) {
            clientPayments.push({
                date: format(endDate, 'yyyy-MM-dd'),
                amount: remainingDays * dailyRate,
                type: 'Pro-rata',
                description: `Pro-rata (${remainingDays} dias)`,
                diasProRata: remainingDays
            });
            totalDividend += remainingDays * dailyRate;
        } else if (remainingDays >= 30) {
            // Very rare edge case, output a full month on payment day and then a pro-rata on end date
            const paymentDayOnLastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), paymentDay);

            clientPayments.push({
                date: format(paymentDayOnLastMonth, 'yyyy-MM-dd'),
                amount: 30 * dailyRate,
                type: 'Dividend',
                description: 'Mensal',
                diasProRata: 0
            });
            totalDividend += 30 * dailyRate;
            accumulatedClientDays += 30;

            const finalDays = Math.max(0, totalDaysTarget - accumulatedClientDays);
            if (finalDays > 0) {
                clientPayments.push({
                    date: format(endDate, 'yyyy-MM-dd'),
                    amount: finalDays * dailyRate,
                    type: 'Pro-rata',
                    description: `Pro-rata (${finalDays} dias)`,
                    diasProRata: finalDays
                });
                totalDividend += finalDays * dailyRate;
            }
        }
    }

    // 4. Return of capital
    clientPayments.push({
        date: format(endDate, 'yyyy-MM-dd'),
        amount: amount,
        type: 'Capital Return',
        description: 'Valor do aporte',
        diasProRata: 0
    });

    // --- CONSULTANT & LEADER COMMISSIONS ---

    // Commission First Payment is Dia 1 of Month AFTER Client's First Payment Month
    // Usually First Payment is next month on Dia 10. The 1st day of the next month after that.
    const consultantInitialPaymentMonth = start.getMonth() + 2; // Month following the first payment month
    const firstCommissionDate = new Date(start.getFullYear(), consultantInitialPaymentMonth, 1);

    const consultantDaysFirstParcel = getCommercialDays(start, firstCommissionDate);
    const actualConsultantDaysFirst = Math.max(0, consultantDaysFirstParcel);

    // Initial Consultant Pro-Rata
    if (consultantRate > 0) {
        consultantCommissions.push({
            date: format(firstCommissionDate, 'yyyy-MM-dd'),
            amount: actualConsultantDaysFirst * consultantDailyRate,
            type: 'Commission',
            description: `Comissão 1/${periodMonths}`,
            diasProRata: actualConsultantDaysFirst
        });
    }

    // Initial Leader Pro-Rata
    if (leaderRate > 0) {
        leaderCommissions.push({
            date: format(firstCommissionDate, 'yyyy-MM-dd'),
            amount: actualConsultantDaysFirst * leaderDailyRate,
            type: 'Commission',
            description: `Comissão Lider 1/${periodMonths}`,
            diasProRata: actualConsultantDaysFirst
        });
    }

    let accumulatedCommissionDays = actualConsultantDaysFirst;
    let lastCommissionDate = firstCommissionDate;

    // Middle months Commissions
    for (let i = 2; i < periodMonths; i++) {
        const nextCommissionPayment = new Date(lastCommissionDate.getFullYear(), lastCommissionDate.getMonth() + 1, 1);

        if (consultantRate > 0) {
            consultantCommissions.push({
                date: format(nextCommissionPayment, 'yyyy-MM-dd'),
                amount: 30 * consultantDailyRate,
                type: 'Commission',
                description: `Comissão ${i}/${periodMonths}`,
                diasProRata: 0
            });
        }
        if (leaderRate > 0) {
            leaderCommissions.push({
                date: format(nextCommissionPayment, 'yyyy-MM-dd'),
                amount: 30 * leaderDailyRate,
                type: 'Commission',
                description: `Comissão Lider ${i}/${periodMonths}`,
                diasProRata: 0
            });
        }
        accumulatedCommissionDays += 30;
        lastCommissionDate = nextCommissionPayment;
    }

    // Last Commission Pro-Rata (Same End Date as Client, but different derived days)
    if (periodMonths > 1) {
        const remainingCommissionDays = Math.max(0, totalDaysTarget - accumulatedCommissionDays);
        // The last commission payment is not necessarily on day 1, it matches the endDate month/day flow
        // The spreadsheet shows it as 01/09/2026 for a 26/08/2026 end date (it gets paid slightly after)
        // Let's use the first of the month of the endDate + 1 month.
        const finalCommissionPaymentDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);

        if (remainingCommissionDays > 0) {
            if (consultantRate > 0) {
                consultantCommissions.push({
                    date: format(finalCommissionPaymentDate, 'yyyy-MM-dd'),
                    amount: remainingCommissionDays * consultantDailyRate,
                    type: 'Commission',
                    description: `Comissão ${periodMonths}/${periodMonths}`,
                    diasProRata: remainingCommissionDays
                });
            }
            if (leaderRate > 0) {
                leaderCommissions.push({
                    date: format(finalCommissionPaymentDate, 'yyyy-MM-dd'),
                    amount: remainingCommissionDays * leaderDailyRate,
                    type: 'Commission',
                    description: `Comissão Lider ${periodMonths}/${periodMonths}`,
                    diasProRata: remainingCommissionDays
                });
            }
        }
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
