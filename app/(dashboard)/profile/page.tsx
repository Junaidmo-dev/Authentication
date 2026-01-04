'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types';

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
        <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-10 animate-fade-in-down">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
                <p className="text-slate-500 dark:text-[#92adc9] text-base">Manage your account details, preferences, and security settings.</p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-200 dark:border-[#233648] flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-transparent"></div>
                <div className="relative z-10">
                    <div className="size-32 rounded-full border-4 border-white dark:border-[#1e293b] shadow-md overflow-hidden">
                        <img src={user?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start pt-2 md:pt-4 relative z-10 gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/20">ADMIN</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-[#233648] p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg bg-slate-50 dark:bg-[#111a22] border border-slate-300 dark:border-[#233648] text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="role">Role</label>
                        <input
                            id="role"
                            type="text"
                            value={formData.role || ''}
                            disabled
                            className="w-full rounded-lg bg-slate-100 dark:bg-[#111a22]/50 border border-slate-300 dark:border-[#233648] text-slate-500 dark:text-slate-400 px-4 py-2.5 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            disabled
                            className="w-full rounded-lg bg-slate-100 dark:bg-[#111a22]/50 border border-slate-300 dark:border-[#233648] text-slate-500 dark:text-slate-400 px-4 py-2.5 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            rows={4}
                            value={formData.bio || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg bg-slate-50 dark:bg-[#111a22] border border-slate-300 dark:border-[#233648] text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Success Toast */}
            {success && (
                <div className="fixed top-20 right-6 z-50 animate-fade-in-down">
                    <div className="flex items-center w-full max-w-xs p-4 space-x-4 text-slate-500 bg-white dark:bg-[#233648] rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <div className="ml-3 text-sm font-normal text-slate-800 dark:text-white">Profile updated successfully.</div>
                    </div>
                </div>
            )}
        </div>
    );
}
