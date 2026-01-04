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
        formData.append('priority', 'medium'); // Default priority

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
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between"
                    >
                        <span className="text-slate-400 group-hover:text-slate-500 transition-colors">
                            Quickly add a new task...
                        </span>
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                    </motion.button>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-800 border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-xl p-4 shadow-lg"
                    >
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                                disabled={isPending}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !title.trim()}
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {isPending ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
