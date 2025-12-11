import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminLogin, adminLogout, getCurrentUser, getAuthToken, setAuthToken } from '../lib/api';

interface User {
    id: number;
    username: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const data = await getCurrentUser();
                    setUser(data.user);
                } catch {
                    setAuthToken(null);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const data = await adminLogin(username, password);
        setUser(data.user);
    };

    const logout = async () => {
        await adminLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
