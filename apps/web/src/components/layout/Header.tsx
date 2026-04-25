"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Header() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Login specific state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  // Register specific state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setNeedsVerification(false);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        toast.success('Login successful!');
        setLoginOpen(false);
        if (data.user.userType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else if (data.needsVerification) {
        setNeedsVerification(true);
        setUnverifiedEmail(data.email);
        toast.error('Email not verified!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Verification email resent! Check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to resend');
    }
  };

  const handleRegister = async () => {
    if (!regEmail.endsWith('@gmail.com')) {
      toast.error('Only Gmail addresses are allowed!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername,
          email: regEmail,
          password: regPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Registration successful! Check your Gmail inbox.');
        setSignupOpen(false);
        router.push(`/verify-pending?email=${encodeURIComponent(regEmail)}`);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-card text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Local Rummy
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/events" className="hover:text-primary">Tournaments</Link>
          <Link href="/promotions" className="hover:text-primary">Promotions</Link>
          <Link href="/about" className="hover:text-primary">About</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent text-white border-primary hover:bg-primary">
                Log In
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogTitle className="sr-only">Log In Modal</DialogTitle>
              <DialogDescription className="sr-only">Enter your credentials to log in.</DialogDescription>
              <div className="space-y-4 p-4 text-white">
                <h2 className="text-2xl font-bold text-center">Log In</h2>

                {needsVerification && (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-sm mb-2">
                      Your email is not verified. Please check your inbox.
                    </p>
                    <button
                      onClick={resendVerification}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      Resend verification email
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setLoginOpen(false);
                      setSignupOpen(true);
                    }}
                    className="text-primary hover:underline font-bold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">Sign Up</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogTitle className="sr-only">Sign Up Modal</DialogTitle>
              <DialogDescription className="sr-only">Create an account to get started.</DialogDescription>
              <div className="space-y-4 p-4 text-white">
                <h2 className="text-2xl font-bold text-center">Create Account</h2>
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                  <Input
                    placeholder="Username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                  <Input
                    placeholder="Email (Gmail only)"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-muted border-border"
                  />
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setSignupOpen(false);
                      setLoginOpen(true);
                    }}
                    className="text-primary hover:underline font-bold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
