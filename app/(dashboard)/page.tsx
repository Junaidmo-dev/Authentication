import Link from 'next/link';
import { getTodos } from '../actions/todos';
import { getNotes } from '../actions/notes';
import { verifySession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import ProductivityAnalytics from '../../components/ProductivityAnalytics';
import DashboardShell, { DashboardHeader } from '../../components/DashboardShell';
import QuickAddTodo from '../../components/QuickAddTodo';
import FocusCard from '../../components/FocusCard';

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
        return null;
    }

    const { todos, notes, user } = data;

    const pendingTodos = todos.filter(t => !t.completed);
    const pinnedNotes = notes.filter(n => n.pinned);
    const firstName = user.name?.split(' ')[0] || 'User';

    // Find the single absolute highest priority task for Focus Card
    const focusTask = pendingTodos.find(t => t.priority === 'high') || pendingTodos[0];

    // Get time of day greeting based on server time (user local time better handled client side but this is OK)
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <DashboardShell>
            {/* Header & Quick Actions */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <DashboardHeader greeting={greeting} name={firstName} />
                    <div className="w-full md:w-96">
                        <QuickAddTodo />
                    </div>
                </div>
            </div>

            {/* Focus Section (Only if tasks exist) */}
            {focusTask && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <FocusCard todo={focusTask} />
                    {/* Welcome stats or quote could go here, for now keeping layout balanced */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-4 text-slate-500 mb-2">
                            <span className="material-symbols-outlined">light_mode</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Daily Snapshot</span>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTodos.length}</p>
                                <p className="text-sm text-slate-500">Pending</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{todos.filter(t => t.completed).length}</p>
                                <p className="text-sm text-slate-500">Completed</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pinnedNotes.length}</p>
                                <p className="text-sm text-slate-500">Pinned Notes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Analytics & Notes */}
                <div className="lg:col-span-2 space-y-8">
                    <ProductivityAnalytics todos={todos} />

                    {/* Pinned Notes Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">push_pin</span>
                                Pinned Notes
                            </h3>
                            <Link href="/notes" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pinnedNotes.length > 0 ? (
                                pinnedNotes.slice(0, 4).map(note => (
                                    <div key={note.id} className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-sm group">
                                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{note.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{note.content || 'No content'}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center h-32 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                                    <p className="text-sm">No pinned notes</p>
                                    <Link href="/notes" className="text-xs text-indigo-600 mt-1">Create one</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Tasks List */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Tasks</h3>
                            <Link href="/todos" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">See All</Link>
                        </div>
                        <div className="p-2 flex-1 overflow-y-auto max-h-[500px]">
                            {pendingTodos.length > 0 ? (
                                <ul className="space-y-1">
                                    {pendingTodos.slice(0, 8).map(todo => (
                                        <li key={todo.id} className="group p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all flex items-start gap-3 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${todo.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                                todo.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{todo.title}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {todo.dueDate && (
                                                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                            {new Date(todo.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {todo.tags && (
                                                        <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                                                            #{todo.tags.split(',')[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-20">task_alt</span>
                                    <p className="text-sm">No pending tasks</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800">
                            <Link href="/todos" className="block w-full text-center py-2 text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors border border-dashed border-slate-300 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50">
                                Go to Task Board
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

