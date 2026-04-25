'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyPendingContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-card rounded-2xl border border-border p-12">
                    <div className="text-5xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
                    <p className="text-muted-foreground mb-2">
                        We've sent a verification link to:
                    </p>
                    <p className="text-primary font-medium mb-6 break-all">
                        {email || 'your Gmail address'}
                    </p>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please check your inbox and click the verification link to activate your account.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                            <p>Didn't receive the email?</p>
                            <p>Check your spam folder or</p>
                            <Link href="/login" className="text-primary hover:text-purple-300 underline mt-2 inline-block">
                                try logging in to resend
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Suspense } from 'react';
export default function VerifyPendingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-white">Loading...</div>}>
            <VerifyPendingContent />
        </Suspense>
    );
}