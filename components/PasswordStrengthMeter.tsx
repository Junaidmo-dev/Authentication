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

    const getColor = () => {
        switch (strength) {
            case 0: return 'bg-slate-200 dark:bg-slate-700';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-emerald-500';
            default: return 'bg-slate-200';
        }
    };

    const getLabel = () => {
        switch (strength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Password Strength</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{getLabel()}</span>
            </div>
            <div className="flex gap-1 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full flex-1 transition-all duration-300 ${strength >= 1 ? getColor() : ''}`}></div>
                <div className={`h-full flex-1 transition-all duration-300 ${strength >= 2 ? getColor() : ''}`}></div>
                <div className={`h-full flex-1 transition-all duration-300 ${strength >= 3 ? getColor() : ''}`}></div>
                <div className={`h-full flex-1 transition-all duration-300 ${strength >= 4 ? getColor() : ''}`}></div>
            </div>
            <ul className="mt-2 space-y-1">
                <li className={`text-[10px] flex items-center gap-1 ${password.length > 7 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[10px]">{password.length > 7 ? 'check' : 'circle'}</span> 8+ Characters
                </li>
                <li className={`text-[10px] flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[10px]">{/[A-Z]/.test(password) ? 'check' : 'circle'}</span> Uppercase
                </li>
                <li className={`text-[10px] flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[10px]">{/[0-9]/.test(password) ? 'check' : 'circle'}</span> Numbers
                </li>
                <li className={`text-[10px] flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[10px]">{/[^A-Za-z0-9]/.test(password) ? 'check' : 'circle'}</span> Special Char
                </li>
            </ul>
        </div>
    );
};
