'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            ESPORTS PRO
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                            Events
                        </Link>
                        <Link href="/blogs" className="text-gray-300 hover:text-white transition-colors">
                            Blog
                        </Link>
                        <Link href="/subscription" className="text-gray-300 hover:text-white transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/wallet"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Wallet
                                </Link>
                                <div className="flex items-center gap-2">
                                    {user?.avatar && (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border border-border"
                                        />
                                    )}
                                    <button
                                        onClick={logout}
                                        className="bg-muted hover:bg-muted text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}