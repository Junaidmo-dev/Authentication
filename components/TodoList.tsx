'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTodo, toggleTodo, deleteTodo } from '../app/actions/todos';
import { reorderTodos } from '../app/actions/reorder';
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

const priorityColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
};

const priorityBorders: Record<string, string> = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-green-500',
};

// Sortable Item Component
function SortableTodoItem({ todo, onToggle, onDelete }: { todo: Todo, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border-l-4 ${priorityBorders[todo.priority]} border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-shadow`}
        >
            {/* Drag Handle */}
            <div {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500">
                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
            </div>

            <button
                onClick={() => onToggle(todo.id)}
                className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-colors flex-shrink-0"
            />

            <div className="flex-1">
                <span className="text-slate-700 dark:text-slate-200 block">{todo.title}</span>
                {todo.tags && (
                    <div className="flex gap-2 mt-1">
                        {todo.tags.split(',').map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <span className={`w-2 h-2 rounded-full ${priorityColors[todo.priority]}`} />

            <button
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </div>
    );
}

export default function TodosPage({ initialTodos }: TodoListProps) {
    const router = useRouter();
    const [todos, setTodos] = useState<Todo[]>(initialTodos);

    useEffect(() => {
        setTodos(initialTodos);
    }, [initialTodos]);

    const [isPending, startTransition] = useTransition();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState('medium');
    const [newTodoTags, setNewTodoTags] = useState('');

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

                // Trigger server reorder
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

        // Optimistic
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
        setTodos(prev => [...prev, optimisticTodo]); // Append to end
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
            // Optimistic update locally? 
            // Actually router.refresh() handles it, but for instant feedback:
            setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
            router.refresh();
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            await deleteTodo(id);
            setTodos(prev => prev.filter(t => t.id !== id));
            router.refresh(); // Ensure synced
        });
    };

    const incompleteTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Todos</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Drag to reorder • {incompleteTodos.length} tasks remaining</p>
            </div>

            <form onSubmit={handleAddTodo} className="mb-8 space-y-3">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value)}
                        className="h-12 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isPending || !newTodoTitle.trim()}
                        className="h-12 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
                <input
                    type="text"
                    value={newTodoTags}
                    onChange={(e) => setNewTodoTags(e.target.value)}
                    placeholder="Tags (comma separated, e.g. Work, Urgent)"
                    className="w-full text-sm px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
            </form>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={incompleteTodos}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {incompleteTodos.map((todo) => (
                            <SortableTodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {completedTodos.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Completed ({completedTodos.length})</h2>
                    <div className="space-y-2 opacity-60">
                        {completedTodos.map((todo) => (
                            <div
                                key={todo.id}
                                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg group"
                            >
                                <button
                                    onClick={() => handleToggle(todo.id)}
                                    className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"
                                >
                                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                </button>
                                <span className="flex-1 text-slate-500 dark:text-slate-400 line-through">{todo.title}</span>
                                <button
                                    onClick={() => handleDelete(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {todos.length === 0 && (
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-3">task_alt</span>
                    <p className="text-slate-500 dark:text-slate-400">No tasks yet. Add one above!</p>
                </div>
            )}
        </div>
    );
}
