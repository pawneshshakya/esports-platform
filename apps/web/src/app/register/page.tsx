'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState('');

    const checkPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Medium';
        return 'Strong';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validations
        if (!form.email.endsWith('@gmail.com')) {
            toast.error('Only Gmail addresses are allowed!');
            setIsLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match!');
            setIsLoading(false);
            return;
        }

        if (passwordStrength === 'Weak') {
            toast.error('Please use a stronger password');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    username: form.username,
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Registration successful! Check your Gmail inbox for verification link.');
                // Redirect to verification pending page
                router.push(`/verify-pending?email=${encodeURIComponent(form.email)}`);
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 'Weak': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Strong': return 'text-green-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground">Join India's biggest esports platform</p>
                </div>

                <div className="bg-card rounded-2xl border border-border p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={form.username}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                placeholder="Choose a username"
                            />
                        </div>

                        {/* Email - Gmail Only */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Email Address <span className="text-primary text-xs">(Gmail only)</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                placeholder="yourname@gmail.com"
                            />
                            {form.email && !form.email.endsWith('@gmail.com') && (
                                <p className="text-red-400 text-xs mt-1">Only @gmail.com addresses allowed</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                placeholder="Create strong password"
                            />
                            {form.password && (
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${passwordStrength === 'Weak' ? 'w-1/3 bg-red-500' :
                                                    passwordStrength === 'Medium' ? 'w-2/3 bg-yellow-500' :
                                                        'w-full bg-green-500'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${getStrengthColor()}`}>
                                        {passwordStrength}
                                    </span>
                                </div>
                            )}
                            <p className="text-muted-foreground text-xs mt-1">
                                Min 8 chars, uppercase, lowercase, number & special char
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                placeholder="Repeat password"
                            />
                            {form.confirmPassword && form.password !== form.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary/60 hover:from-purple-700 hover:to-primary/60 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-purple-300 font-medium">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}