'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { signup } from '../../actions/auth';
import { PasswordStrengthMeter } from '../../../components/PasswordStrengthMeter';

export default function SignupPage() {
    const [state, action, isPending] = useActionState(signup, {});
    const [password, setPassword] = useState('');

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="w-full max-w-[480px] z-10">
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white">Create your account</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base">Start your secure dashboard journey today.</p>
                </div>

                <div className="bg-white dark:bg-[#192633] border border-gray-200 dark:border-[#233648] rounded-xl shadow-xl p-6 sm:p-8">
                    <form action={action} className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="block w-full rounded-lg border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-colors"
                                placeholder="John Doe"
                            />
                            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="block w-full rounded-lg border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-colors"
                                placeholder="john@example.com"
                            />
                            {state.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 dark:border-[#324d67] bg-gray-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-colors"
                                placeholder="Create a password"
                            />
                            <PasswordStrengthMeter password={password} />
                            {state.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>}
                        </div>

                        {state.message && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">{state.message}</div>}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="mt-2 flex w-full justify-center rounded-lg bg-primary py-3 px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed items-center gap-2"
                        >
                            {isPending && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            {isPending ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                            Already have an account?
                            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 ml-1">Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
