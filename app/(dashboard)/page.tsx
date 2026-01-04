import Link from 'next/link';
import { getTodos } from '../actions/todos';
import { getNotes } from '../actions/notes';
import { verifySession } from '../../lib/session';
import { prisma } from '../../lib/prisma';

async function getDashboardData() {
    const session = await verifySession();
    if (!session) return null;

    const [todos, notes, user] = await Promise.all([
        getTodos(),
        getNotes(),
        prisma.user.findUnique({ where: { id: session.userId } }),
    ]);

    return { todos, notes, user };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    if (!data || !data.user) {
        return null; // Layout handles auth redirect usually, or we show a clean loading/empty state
    }

    const { todos, notes, user } = data;

    const pendingTodos = todos.filter(t => !t.completed);
    const pinnedNotes = notes.filter(n => n.pinned);
    const firstName = user.name?.split(' ')[0] || 'User';

    // Get time of day greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8 text-slate-800 dark:text-slate-200">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {greeting}, {firstName}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's on your plate for today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/notes" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        View Notes
                    </Link>
                    <Link href="/todos" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none transition-colors">
                        + New Task
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Pending Tasks"
                    value={pendingTodos.length}
                    icon="check_circle"
                    color="text-indigo-600 dark:text-indigo-400"
                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                />
                <StatCard
                    label="Pinned Notes"
                    value={pinnedNotes.length}
                    icon="push_pin"
                    color="text-amber-600 dark:text-amber-400"
                    bg="bg-amber-50 dark:bg-amber-900/20"
                />
                <StatCard
                    label="Total Notes"
                    value={notes.length}
                    icon="library_books"
                    color="text-green-600 dark:text-green-400"
                    bg="bg-green-50 dark:bg-green-900/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Tasks Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Tasks</h3>
                        <Link href="/todos" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All</Link>
                    </div>
                    <div className="p-2 flex-1">
                        {pendingTodos.length > 0 ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {pendingTodos.slice(0, 5).map(todo => (
                                    <li key={todo.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${todo.priority === 'high' ? 'bg-red-500' :
                                                todo.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                            }`} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1 flex-1">{todo.title}</span>
                                        {todo.dueDate && (
                                            <span className="text-xs text-slate-400">
                                                {new Date(todo.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">task_alt</span>
                                <p className="text-sm">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pinned Notes Widget */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Pinned Notes</h3>
                        <Link href="/notes" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All</Link>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pinnedNotes.length > 0 ? (
                            pinnedNotes.slice(0, 4).map(note => (
                                <div key={note.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{note.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{note.content || 'No content'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center h-48 text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">push_pin</span>
                                <p className="text-sm">No pinned notes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg }: { label: string, value: number, icon: string, color: string, bg: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
