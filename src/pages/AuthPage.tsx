import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dog, ArrowLeft, Chrome } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { playSound } from '../lib/sounds';

export function AuthPage() {
    const { login, isLoading, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Get the redirect path from location state, or default to home
    const from = (location.state as any)?.from?.pathname || "/";

    const handleGoogleLogin = async () => {
        playSound('click');
        setIsLoggingIn(true);
        await login();
        playSound('success');
        navigate(from, { replace: true });
    };

    if (user) {
        navigate(from, { replace: true });
        return null;
    }

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <header className="mb-12 text-center">
                    <div
                        onClick={() => navigate('/')}
                        className="text-4xl font-bold text-brand-brown flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mb-2"
                    >
                        <Dog className="text-brand-coral w-10 h-10" />
                        Dog Drop
                    </div>
                    <p className="text-brand-brown/60 font-medium">Join the pack to start your drop</p>
                </header>

                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-coral/5 rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-brown/5 rounded-full" />

                    <h2 className="text-3xl font-black text-brand-brown mb-8 text-center">
                        {location.state?.from ? 'Sign in to checkout' : 'Join the Pack'}
                    </h2>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn || isLoading}
                            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-lg text-brand-brown hover:bg-gray-50 hover:border-brand-coral/20 hover:shadow-md transition-all shadow-sm group disabled:opacity-50"
                        >
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                            </div>
                            {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
                        </button>


                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-8 flex items-center justify-center gap-2 w-full text-brand-brown/40 font-bold hover:text-brand-brown transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </button>
            </motion.div>

            <footer className="mt-12 text-brand-brown/20 text-xs font-bold uppercase tracking-[0.2em]">
                Dog Drop Studio © 2026
            </footer>
        </div>
    );
}
