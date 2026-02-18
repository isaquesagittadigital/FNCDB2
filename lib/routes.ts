/**
 * Route configuration for all user roles.
 * Maps internal tab IDs to URL-friendly slugs.
 */

// ── Client Routes ──
export const clientRoutes: Record<string, string> = {
    dashboard: 'dashboard',
    documents: 'documentos',
    calendar: 'calendario',
    profile: 'meus-dados',
    notifications: 'notificacoes',
};

// ── Consultant Routes ──
export const consultantRoutes: Record<string, string> = {
    dashboard: 'dashboard',
    simulator: 'simulador',
    clients: 'clientes',
    contracts: 'contratos',
    invoice: 'nota-fiscal',
    yields: 'informe-rendimentos',
    calendar: 'calendario',
    profile: 'meus-dados',
    notifications: 'notificacoes',
    approval: 'aprovacao',
    reports_detailed: 'carteira-detalhada',
    reports_portfolios: 'relatorio-carteiras',
    reports_commission: 'comissao-mensal',
};

// ── Admin Routes ──
export const adminRoutes: Record<string, string> = {
    dashboard: 'dashboard',
    approval: 'aprovacao',
    clients: 'clientes',
    consultants: 'consultores',
    contracts: 'contratos',
    invoices: 'nota-fiscal',
    income_reports: 'informe-rendimentos',
    detailed_portfolio: 'carteira-detalhada',
    portfolio_report: 'relatorio-carteiras',
    monthly_commission: 'comissao-mensal',
    calendar: 'calendario',
    payments: 'pagamentos',
    simulation: 'simulacao',
    profile: 'meus-dados',
    administrators: 'usuarios',
    notifications: 'notificacoes',
    documents: 'documentos',
};

// ── Role prefixes ──
export const rolePrefixes: Record<string, string> = {
    client: 'cliente',
    consultant: 'consultor',
    admin: 'admin',
};

// ── Helper: tabId → full URL path ──
export function getRoutePath(role: string, tabId: string): string {
    const prefix = rolePrefixes[role] || role;
    const routes =
        role === 'client' ? clientRoutes :
            role === 'consultant' ? consultantRoutes :
                adminRoutes;
    const slug = routes[tabId] || tabId;
    return `/${prefix}/${slug}`;
}

// ── Helper: URL slug → tabId ──
function invertMap(map: Record<string, string>): Record<string, string> {
    const inverted: Record<string, string> = {};
    for (const [key, value] of Object.entries(map)) {
        inverted[value] = key;
    }
    return inverted;
}

const clientSlugsToTab = invertMap(clientRoutes);
const consultantSlugsToTab = invertMap(consultantRoutes);
const adminSlugsToTab = invertMap(adminRoutes);

export function getTabFromSlug(role: string, slug: string): string {
    const map =
        role === 'client' ? clientSlugsToTab :
            role === 'consultant' ? consultantSlugsToTab :
                adminSlugsToTab;
    return map[slug] || 'dashboard';
}

// ── Get role from URL prefix ──
export function getRoleFromPrefix(prefix: string): string | null {
    for (const [role, p] of Object.entries(rolePrefixes)) {
        if (p === prefix) return role;
    }
    return null;
}
