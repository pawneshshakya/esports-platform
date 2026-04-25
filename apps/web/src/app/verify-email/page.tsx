'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Network error');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="bg-card rounded-2xl border border-border p-12">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-card rounded-2xl border border-green-500/30 p-12">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <Link
                            href="/login"
                            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Login Now
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-card rounded-2xl border border-red-500/30 p-12">
                        <div className="text-5xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/register"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Register Again
                            </Link>
                            <Link
                                href="/login"
                                className="bg-muted hover:bg-muted text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Suspense } from 'react';
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center px-4"><div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" /><h2 className="text-xl font-bold text-white">Verifying...</h2></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}