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

    const pendingTodos = todos.filter((t: any) => !t.completed);
    const pinnedNotes = notes.filter((n: any) => n.pinned);
    const firstName = user.name?.split(' ')[0] || 'User';

    const focusTask = pendingTodos.find((t: any) => t.priority === 'high') || pendingTodos[0];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';

    return (
        <DashboardShell>
            {/* Minimal Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <DashboardHeader greeting={greeting} name={firstName} />
                <div className="w-full lg:w-[400px]">
                    <QuickAddTodo />
                </div>
            </div>

            {/* Dashboard Primary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Content Area - 8 columns */}
                <div className="lg:col-span-8 space-y-12">

                    {/* High Priority Focus */}
                    {focusTask && (
                        <section>
                            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Strategic Focus</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FocusCard todo={focusTask} />
                                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                                    <p className="text-zinc-500 text-sm leading-relaxed italic">
                                        "Simplicity is the ultimate sophistication."
                                    </p>
                                    <div className="flex gap-6 mt-4">
                                        <div>
                                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{pendingTodos.length}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{pinnedNotes.length}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pinned</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Analytics Section */}
                    <section>
                        <ProductivityAnalytics todos={todos} />
                    </section>

                    {/* Pinned Notes Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Essential Notes</h3>
                            </div>
                            <Link href="/notes" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Explorer</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pinnedNotes.length > 0 ? (
                                pinnedNotes.slice(0, 4).map((note: any) => (
                                    <Link
                                        key={note.id}
                                        href="/notes"
                                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all shadow-soft group"
                                    >
                                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2 truncate group-hover:text-zinc-500 transition-colors">{note.title}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{note.content || 'No text content'}</p>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-400 text-sm font-medium">No critical notes identified.</p>
                                    <Link href="/notes" className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-3 hover:underline">Draft new note</Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Tasks - 4 columns */}
                <aside className="lg:col-span-4 lg:sticky lg:top-8">
                    <div className="bg-zinc-900 dark:bg-zinc-50 rounded-3xl p-1 shadow-2xl">
                        <div className="bg-white dark:bg-zinc-900 rounded-[1.4rem] overflow-hidden">
                            <div className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Tasks</h3>
                                <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                    <span className="material-symbols-outlined text-zinc-400 text-sm">list_alt</span>
                                </div>
                            </div>
                            <div className="p-2 overflow-y-auto max-h-[600px]">
                                {pendingTodos.length > 0 ? (
                                    <ul className="space-y-1">
                                        {pendingTodos.slice(0, 10).map((todo: any) => (
                                            <li key={todo.id} className="group p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all cursor-default flex items-start gap-4">
                                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${todo.priority === 'high' ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-600'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{todo.title}</span>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        {todo.dueDate && (
                                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                                {new Date(todo.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                        {todo.tags && (
                                                            <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                {todo.tags.split(',')[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
                                        <span className="material-symbols-outlined text-3xl mb-3 opacity-20">task_alt</span>
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Zen state reached</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                                <Link href="/todos" className="flex items-center justify-center gap-2 w-full py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                    Manage Repository
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

            </div>
        </DashboardShell>
    );
}
