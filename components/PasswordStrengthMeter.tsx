'use client';

import React, { useEffect, useState } from 'react';

interface PasswordStrengthMeterProps {
    password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        let score = 0;
        if (!password) {
            setStrength(0);
            return;
        }

        if (password.length > 7) score += 1;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        setStrength(score);
    }, [password]);

    const getStrengthLevel = () => {
        if (strength === 0) return { label: 'Incomplete', class: 'bg-zinc-200 dark:bg-zinc-800' };
        if (strength <= 2) return { label: 'Weak', class: 'bg-rose-500' };
        if (strength === 3) return { label: 'Medium', class: 'bg-amber-500' };
        return { label: 'Strong', class: 'bg-emerald-500' };
    };

    const level = getStrengthLevel();

    return (
        <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Entropy Analysis</span>
                <span className={`text-[9px] font-black uppercase tracking-widest ${strength === 4 ? 'text-emerald-500' : 'text-zinc-500'}`}>{level.label}</span>
            </div>
            <div className="flex gap-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-500 rounded-full ${strength >= step ? level.class : 'bg-transparent'}`}
                    ></div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                <div className={`flex items-center gap-2 transition-colors ${password.length > 7 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    <div className={`w-1 h-1 rounded-full ${password.length > 7 ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Length [8+]</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors ${/[A-Z]/.test(password) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(password) ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Case [A-Z]</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors ${/[0-9]/.test(password) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Numeric [0-9]</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors ${/[^A-Za-z0-9]/.test(password) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Symbol [#$!]</span>
                </div>
            </div>
        </div>
    );
};
