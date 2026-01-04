'use client';

import { motion } from 'framer-motion';

export default function FocusCard({ todo }: { todo: any }) {
    if (!todo) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 p-6 text-white shadow-soft"
        >
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current Focus</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 tracking-tight text-slate-100">{todo.title}</h3>
                    {todo.dueDate && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
                            <span className="text-xs text-slate-300">
                                Due {new Date(todo.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-[20px]">target</span>
                </div>
            </div>

            {/* Subtle background texture/accent instead of big glowing blobs */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">verified</span>
            </div>
        </motion.div>
    );
}
