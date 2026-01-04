'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { login } from '../../actions/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, {});

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sansSelection text-zinc-900 dark:text-zinc-100">
            {/* Minimalist Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-100 dark:bg-zinc-900/40 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-100 dark:bg-zinc-900/40 rounded-full blur-[120px] -ml-64 -mb-64 opacity-50"></div>

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl mb-2">
                        <span className="material-symbols-outlined text-[32px]">shield</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Login</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Welcome Back</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-soft p-10 backdrop-blur-sm">
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none ring-zinc-900 dark:ring-zinc-100 focus:ring-1 transition-all"
                                placeholder="name@company.com"
                            />
                            {state.errors?.email && <p className="text-rose-500 text-[10px] font-bold pl-1 uppercase tracking-tighter">{state.errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center pl-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest" htmlFor="password">Password</label>
                                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Forgot?</a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none ring-zinc-900 dark:ring-zinc-100 focus:ring-1 transition-all"
                                placeholder="••••••••"
                            />
                            {state.errors?.password && <p className="text-rose-500 text-[10px] font-bold pl-1 uppercase tracking-tighter">{state.errors.password[0]}</p>}
                        </div>

                        {state.message === 'USER_NOT_FOUND' ? (
                            <div className="p-5 bg-zinc-900 dark:bg-zinc-800 border border-zinc-100/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center gap-3 text-zinc-100">
                                    <span className="material-symbols-outlined text-[20px] opacity-70">person_off</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Account Not Found</p>
                                </div>
                                <p className="text-zinc-400 text-[10px] font-bold leading-relaxed uppercase tracking-tighter opacity-80">
                                    This email is not registered. Would you like to create an account?
                                </p>
                                <Link
                                    href="/signup"
                                    className="block w-full text-center py-3 bg-zinc-100 text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl"
                                >
                                    Create Account
                                </Link>
                            </div>
                        ) : state.message && (
                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                                {state.message === 'Invalid credentials.' ? 'Credentials Verification Failed' : 'System Authorization Error'}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isPending ? (
                                    <>
                                        <span className="animate-pulse">Authorizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Log In</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        Don't have an account?
                        <Link href="/signup" className="text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-8 ml-2">Sign Up</Link>
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-2 opacity-30 group grayscale hover:grayscale-0 transition-all cursor-default">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">SSL Ready</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-30 grayscale cursor-default">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Next v15</span>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}
