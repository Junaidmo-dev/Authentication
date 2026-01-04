'use client';

interface Todo {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AnalyticsProps {
    todos: Todo[];
}

export default function ProductivityAnalytics({ todos }: AnalyticsProps) {
    // Calculate metrics
    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate tasks completed this week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCompleted = todos.filter(t => {
        const completedDate = new Date(t.updatedAt);
        return t.completed && completedDate >= weekAgo;
    }).length;

    // Calculate current streak
    const calculateStreak = () => {
        const sortedTodos = [...todos]
            .filter(t => t.completed)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const todo of sortedTodos) {
            const todoDate = new Date(todo.updatedAt);
            todoDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate.getTime() - todoDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === streak || diffDays === streak + 1) {
                streak = diffDays > streak ? diffDays : streak;
                if (diffDays === 0) streak++;
            } else if (diffDays > streak + 1) {
                break;
            }
        }
        return streak;
    };

    // Find most productive day
    const findMostProductiveDay = () => {
        const dayCount: { [key: string]: number } = {};

        todos.filter(t => t.completed).forEach(todo => {
            const date = new Date(todo.updatedAt);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        });

        const entries = Object.entries(dayCount);
        if (entries.length === 0) return { day: 'N/A', count: 0 };

        const [day, count] = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
        return { day, count };
    };

    const streak = calculateStreak();
    const mostProductiveDay = findMostProductiveDay();

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-soft">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Analytics</h2>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">Performance Overview</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <span className="material-symbols-outlined text-zinc-400 text-lg">monitoring</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Completion Rate */}
                <div className="group">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Completion</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter">{completionRate}</span>
                        <span className="text-sm font-medium text-zinc-500">%</span>
                    </div>
                    <div className="mt-3 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-700 ease-out group-hover:bg-blue-500"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                {/* Weekly Completed */}
                <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Weekly</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter">{weeklyCompleted}</span>
                        <span className="text-sm font-medium text-zinc-500">Done</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2 font-medium">Last 7 calendar days</p>
                </div>

                {/* Streak */}
                <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Streak</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter">{streak}</span>
                        <span className="text-sm font-medium text-zinc-500">Days</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2 font-medium">Consecutive activity</p>
                </div>

                {/* Best Day */}
                <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Peak Flow</p>
                    <div className="flex items-baseline gap-1 overflow-hidden">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter truncate">{mostProductiveDay.day}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-3 font-medium">Most active weekday</p>
                </div>
            </div>

            {/* Mini Chart - High End Style */}
            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">7-Day Activity</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                            <span className="text-[10px] font-medium text-zinc-500">Activity</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between gap-3 h-20">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        date.setHours(0, 0, 0, 0);

                        const nextDate = new Date(date);
                        nextDate.setDate(nextDate.getDate() + 1);

                        const dayCompleted = todos.filter(t => {
                            const todoDate = new Date(t.updatedAt);
                            return t.completed && todoDate >= date && todoDate < nextDate;
                        }).length;

                        const maxHeight = 100;
                        const height = dayCompleted > 0 ? Math.max(15, Math.min(100, (dayCompleted / 3) * maxHeight)) : 4;

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                                    <div
                                        className={`w-full rounded-sm transition-all duration-300 ${dayCompleted > 0
                                                ? 'bg-zinc-900 dark:bg-zinc-100 group-hover:bg-zinc-600 dark:group-hover:bg-zinc-400'
                                                : 'bg-zinc-100 dark:bg-zinc-800'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-[9px] font-bold text-zinc-400 mt-3 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })[0].toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
