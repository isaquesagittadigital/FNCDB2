
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Permission {
    modulo: string;
    pode_visualizar: boolean;
    pode_cadastrar: boolean;
    pode_editar: boolean;
    pode_excluir: boolean;
}

interface PermissionsContextType {
    permissions: Permission[];
    hasPermission: (module: string, action: 'visualizar' | 'cadastrar' | 'editar' | 'excluir') => boolean;
    setPermissions: (permissions: Permission[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        const savedPerms = localStorage.getItem('permissions');
        if (savedPerms) {
            try {
                setPermissions(JSON.parse(savedPerms));
            } catch (e) {
                console.error("Failed to parse permissions", e);
            }
        }
    }, []);

    const hasPermission = (module: string, action: 'visualizar' | 'cadastrar' | 'editar' | 'excluir') => {
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
            try {
                const profile = JSON.parse(profileStr);
                // Admin has full access by default, but we can still check specific rules if needed.
                // For now, let's keep Admins with full access.
                if (profile.tipo_user === 'Admin') return true;
            } catch (e) {
                console.error("Error parsing profile in permissions context", e);
            }
        }

        const perm = permissions.find(p => p.modulo === module);
        if (!perm) return false;

        switch (action) {
            case 'visualizar': return !!perm.pode_visualizar;
            case 'cadastrar': return !!perm.pode_cadastrar;
            case 'editar': return !!perm.pode_editar;
            case 'excluir': return !!perm.pode_excluir;
            default: return false;
        }
    };

    return (
        <PermissionsContext.Provider value={{ permissions, hasPermission, setPermissions }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
};
