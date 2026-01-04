'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { login } from '../../actions/auth';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, {});

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]"></div>
            </div>

            <main className="relative z-10 w-full max-w-[480px] bg-white dark:bg-[#1a2634] rounded-xl shadow-2xl border border-slate-200 dark:border-[#324d67] overflow-hidden">
                <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>security</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Secure Dashboard App</h1>
                    <p className="text-slate-500 dark:text-[#92adc9] text-sm">Enter your credentials to access the secure dashboard</p>
                </div>

                <div className="px-8 pb-10">
                    <form action={action} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-sm font-medium" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="form-input flex w-full rounded-lg border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-primary h-12 px-4"
                                    placeholder="name@company.com"
                                />
                            </div>
                            {state.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-slate-900 dark:text-white text-sm font-medium" htmlFor="password">Password</label>
                                <a href="#" className="text-primary hover:text-primary-hover text-xs font-medium">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="form-input flex w-full rounded-lg border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-primary h-12 px-4"
                                    placeholder="••••••••••"
                                />
                            </div>
                            {state.errors?.password && <p className="text-red-500 text-xs">{state.errors.password[0]}</p>}
                        </div>

                        {state.message === 'USER_NOT_FOUND' ? (
                            <div className="p-4 bg-zinc-900 border border-zinc-100/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-2 text-zinc-100">
                                    <span className="material-symbols-outlined text-[20px]">person_off</span>
                                    <p className="text-xs font-black uppercase tracking-widest italic">Account Not Registered</p>
                                </div>
                                <p className="text-zinc-400 text-[11px] leading-relaxed">
                                    This signature does not exist in our secure registries. Would you like to initialize a new operator profile?
                                </p>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center py-2 bg-zinc-100 text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg"
                                >
                                    Initialize Account
                                </Link>
                            </div>
                        ) : state.message && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {state.message === 'Invalid credentials.' ? 'Credentials Verification Failed' : 'System Error: Unauthorized'}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="group-hover:translate-x-0.5 transition-transform">{isPending ? 'Logging In...' : 'Log In'}</span>
                                {!isPending && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_forward</span>}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 dark:bg-[#111a22] p-4 text-center border-t border-slate-200 dark:border-[#324d67]">
                    <p className="text-slate-500 dark:text-[#92adc9] text-sm">
                        Don't have an account?
                        <Link href="/signup" className="text-primary hover:text-primary-hover font-medium ml-1">Sign up</Link>
                    </p>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
                    <span className="material-symbols-outlined text-green-500" style={{ fontSize: '14px' }}>lock</span>
                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">SSL Secured</span>
                </div>
            </main>
        </div>
    );
}
