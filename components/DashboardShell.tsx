'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-10"
        >
            {children}
        </motion.div>
    );
}

export function DashboardHeader({ greeting, name }: { greeting: string, name: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col gap-1"
        >
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {greeting}, <span className="text-zinc-500">{name}</span>
            </h1>
            <p className="text-sm font-medium text-zinc-400 max-w-md">
                Systems status optimal. Here is your situational overview for today.
            </p>
        </motion.div>
    );
}
