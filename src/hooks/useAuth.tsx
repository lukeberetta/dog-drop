import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem('dog-drop-user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = () => {
        // Mock login for now
        setIsLoading(true);
        setTimeout(() => {
            const mockUser = {
                id: '123',
                name: 'Guest User',
                email: 'guest@example.com',
                picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy'
            };
            setUser(mockUser);
            localStorage.setItem('dog-drop-user', JSON.stringify(mockUser));
            setIsLoading(false);
        }, 1000);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dog-drop-user');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
