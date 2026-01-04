'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            await updateProfile({ ...user, ...formData } as User);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-12">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Profile</h1>
                <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Operator Identity & System Preferences</p>
            </header>

            {/* Profile Hero with Photos */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group shadow-2xl rounded-[2rem] overflow-hidden"
            >
                {/* Cover Image */}
                <div className="h-64 sm:h-80 w-full relative">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                        alt="Workspace"
                        className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Avatar Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col sm:flex-row items-end sm:items-center gap-6 translate-y-1/2 sm:translate-y-1/3">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-3xl bg-zinc-900 dark:bg-zinc-100 p-1 shadow-2xl border-4 border-white dark:border-zinc-900">
                            <div className="w-full h-full rounded-[1.2rem] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Adjusting spacing for the avatar overlay */}
            <div className="pt-20 sm:pt-16 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{user?.name}</h2>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-tighter mt-1">{user?.role || 'Senior Operator'} · {user?.email}</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        System Verified
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                {/* Left Column: Details form */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-soft">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="name">Display Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="role">Security Role</label>
                                    <input
                                        id="role"
                                        type="text"
                                        value={formData.role || ''}
                                        disabled
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="email">Encrypted Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    disabled
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold opacity-50 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400" htmlFor="bio">Operator Manifesto</label>
                                <textarea
                                    id="bio"
                                    rows={4}
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    placeholder="Your professional bio..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl">
                                    Sync Profile
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Right Column: Gallery/Status */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-zinc-900 dark:bg-zinc-50 rounded-3xl p-8 text-zinc-100 dark:text-zinc-900 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined">verified</span>
                            <h3 className="font-black uppercase tracking-widest text-xs">Security Status</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className="opacity-60">Uptime</span>
                                <span>99.9%</span>
                            </div>
                            <div className="h-1 bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "99.9%" }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] font-medium opacity-50 leading-relaxed italic">
                            Authentication verified via RSA-2048. All communications channeled through encrypted tunnels.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Visual Log</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Log 1" />
                            </div>
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Log 2" />
                            </div>
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img src="https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Log 3" />
                            </div>
                            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Log 4" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Success Toast */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-12 right-12 z-50"
                >
                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <span className="text-sm font-bold tracking-tight">System configuration synced successfully.</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
