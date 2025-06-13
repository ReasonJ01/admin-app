'use client';

import { SignInForm } from '@/components/auth/sign-in-form';

export default function AuthPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex justify-center">
            <div className="container">
                <div className="mx-auto w-full max-w-[400px] relative pt-[calc(15vh+3rem)]">
                    <SignInForm />
                </div>
            </div>
        </div>
    );
} 