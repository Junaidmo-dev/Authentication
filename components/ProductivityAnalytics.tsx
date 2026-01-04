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
        // Ensure we handle both Date objects and strings (if serialized)
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Productivity Analytics</h2>
                <span className="material-symbols-outlined text-slate-400">insights</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Completion Rate */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">percent</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completion Rate</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{completionRate}</span>
                        <span className="text-lg text-slate-500 dark:text-slate-400 mb-1">%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>

                {/* Weekly Completed */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px]">check_circle</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">This Week</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{weeklyCompleted}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">tasks</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Last 7 days</p>
                </div>

                {/* Streak */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[18px]">local_fire_department</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Streak</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{streak}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">days</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {streak > 0 ? 'Keep it up! 🔥' : 'Start your streak today!'}
                    </p>
                </div>

                {/* Most Productive Day */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[18px]">calendar_today</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Best Day</span>
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{mostProductiveDay.day}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {mostProductiveDay.count > 0 ? `${mostProductiveDay.count} tasks completed` : 'Complete more to find out!'}
                    </p>
                </div>
            </div>

            {/* Mini Chart - Last 7 Days */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Last 7 Days Activity</h3>
                <div className="flex items-end justify-between gap-2 h-24">
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
                        const height = dayCompleted > 0 ? Math.max(20, (dayCompleted / 5) * maxHeight) : 8;

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                                    <div
                                        className={`w-full rounded-t transition-all ${dayCompleted > 0
                                                ? 'bg-blue-500 dark:bg-blue-400'
                                                : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        style={{ height: `${height}%` }}
                                        title={`${dayCompleted} tasks`}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
