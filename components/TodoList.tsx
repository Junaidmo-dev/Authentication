'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTodo, toggleTodo, deleteTodo } from '../app/actions/todos';
import { reorderTodos } from '../app/actions/reorder';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Todo {
    id: string;
    title: string;
    completed: boolean;
    priority: string;
    dueDate: string | null;
    tags?: string;
    createdAt: string;
    order?: number;
}

interface TodoListProps {
    initialTodos: Todo[];
}

// Minimal Priority Indicators
const priorityIndicators: Record<string, string> = {
    high: 'bg-zinc-900 dark:bg-zinc-100',
    medium: 'bg-zinc-400 dark:bg-zinc-600',
    low: 'bg-zinc-200 dark:bg-zinc-800',
};

function SortableTodoItem({ todo, onToggle, onDelete }: { todo: Todo, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            layout
            className={`flex items-center gap-5 p-5 bg-white dark:bg-zinc-900 rounded-3xl border ${isDragging ? 'border-zinc-900 dark:border-zinc-100 shadow-2xl' : 'border-zinc-100 dark:border-zinc-800 shadow-soft'} group transition-all`}
        >
            <div {...listeners} className="cursor-grab text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-400">
                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
            </div>

            <button
                onClick={() => onToggle(todo.id)}
                className="w-6 h-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors flex-shrink-0 flex items-center justify-center group/check"
            >
                <span className="material-symbols-outlined text-[16px] opacity-0 group-hover/check:opacity-100 transition-opacity">check</span>
            </button>

            <div className="flex-1 min-w-0">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm tracking-tight block truncate">{todo.title}</span>
                {todo.tags && (
                    <div className="flex gap-2 mt-1.5">
                        {todo.tags.split(',').map(tag => (
                            <span key={tag} className="text-[9px] uppercase font-black tracking-widest text-zinc-400 border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className={`w-1.5 h-1.5 rounded-full ${priorityIndicators[todo.priority]}`} />

            <button
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all p-2"
            >
                <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
        </motion.div>
    );
}

export default function TodosPage({ initialTodos }: TodoListProps) {
    const router = useRouter();
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [isPending, startTransition] = useTransition();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState('medium');
    const [newTodoTags, setNewTodoTags] = useState('');

    useEffect(() => {
        setTodos(initialTodos);
    }, [initialTodos]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTodos((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const reorderedData = newItems.map((item, index) => ({ id: item.id, order: index }));
                startTransition(() => {
                    reorderTodos(reorderedData);
                });

                return newItems;
            });
        }
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        const formData = new FormData();
        formData.append('title', newTodoTitle);
        formData.append('priority', newTodoPriority);
        formData.append('tags', newTodoTags);

        const tempId = Math.random().toString();
        const optimisticTodo: Todo = {
            id: tempId,
            title: newTodoTitle,
            completed: false,
            priority: newTodoPriority,
            tags: newTodoTags,
            dueDate: null,
            createdAt: new Date().toISOString()
        };
        setTodos(prev => [...prev, optimisticTodo]);
        setNewTodoTitle('');
        setNewTodoTags('');

        startTransition(async () => {
            await createTodo(formData);
            router.refresh();
        });
    };

    const handleToggle = async (id: string) => {
        startTransition(async () => {
            await toggleTodo(id);
            setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
            router.refresh();
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            await deleteTodo(id);
            setTodos(prev => prev.filter(t => t.id !== id));
            router.refresh();
        });
    };

    const incompleteTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    return (
        <div className="max-w-3xl mx-auto py-10 px-6 space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Task Repository</h1>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{incompleteTodos.length} Active Directives</p>
            </header>

            {/* High-End Input Form */}
            <form onSubmit={handleAddTodo} className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 space-y-4 shadow-soft">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Draft a new directive..."
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none transition-all"
                    />
                    <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 text-xs font-black uppercase tracking-widest focus:ring-1 focus:ring-zinc-900 outline-none"
                    >
                        <option value="low">Priority Low</option>
                        <option value="medium">Priority Med</option>
                        <option value="high">Priority High</option>
                    </select>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newTodoTags}
                        onChange={(e) => setNewTodoTags(e.target.value)}
                        placeholder="Tags (Comma separated)"
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-zinc-900 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isPending || !newTodoTitle.trim()}
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-20 transition-all shadow-xl"
                    >
                        Deploy
                    </button>
                </div>
            </form>

            {/* List Sections */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={incompleteTodos}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {incompleteTodos.map((todo) => (
                                <SortableTodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>

            {completedTodos.length > 0 && (
                <div className="pt-8 space-y-4">
                    <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] px-4">Archived Operations ({completedTodos.length})</h2>
                    <div className="space-y-2 opacity-40">
                        {completedTodos.map((todo) => (
                            <div
                                key={todo.id}
                                className="flex items-center gap-5 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 group"
                            >
                                <button
                                    onClick={() => handleToggle(todo.id)}
                                    className="w-6 h-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <span className="material-symbols-outlined text-white dark:text-zinc-900 text-[14px]">check</span>
                                </button>
                                <span className="flex-1 text-sm font-bold text-zinc-500 line-through tracking-tight">{todo.title}</span>
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {todos.length === 0 && (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-700 mb-4 opacity-50">inventory_2</span>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Zero Pending Operations</p>
                </div>
            )}
        </div>
    );
}
