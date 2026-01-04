'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
        >
            {children}
        </motion.div>
    );
}

export function DashboardHeader({ greeting, name, onCreateTodo }: { greeting: string, name: string, onCreateTodo?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                    {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{name}</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Ready to conquer your day? Here's your overview.
                </p>
            </div>
        </motion.div>
    );
}
