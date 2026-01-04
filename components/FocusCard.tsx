'use client';

import { motion } from 'framer-motion';

export default function FocusCard({ todo }: { todo: any }) {
    if (!todo) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg"
        >
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <span className="material-symbols-outlined text-sm">stars</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Top Priority</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{todo.title}</h3>
                    {todo.dueDate && (
                        <p className="text-sm opacity-80 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">event</span>
                            Due {new Date(todo.dueDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <span className="text-2xl">🎯</span>
                </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-black/10 blur-2xl" />
        </motion.div>
    );
}
