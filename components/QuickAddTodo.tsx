'use client';

import { useState } from 'react';
import { createTodo } from '../app/actions/todos';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickAddTodo() {
    const [title, setTitle] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsPending(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('priority', 'medium');

        await createTodo(formData);

        setTitle('');
        setIsPending(false);
        setIsExpanded(false);
    };

    return (
        <div className="relative z-10">
            <AnimatePresence>
                {!isExpanded ? (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(true)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-left shadow-soft hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-zinc-400 text-[20px] group-hover:text-zinc-600 transition-colors">add_circle</span>
                            <span className="text-zinc-500 text-sm font-medium">Quickly add a task...</span>
                        </div>
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                            <span className="text-xs">⌘</span>N
                        </kbd>
                    </motion.button>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-xl p-3 shadow-xl"
                    >
                        <div className="flex flex-col gap-3">
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none text-sm font-medium px-1"
                                disabled={isPending}
                            />
                            <div className="flex justify-end items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !title.trim()}
                                    className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-30 transition-all"
                                >
                                    {isPending ? 'Saving...' : 'Add Now'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
