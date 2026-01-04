'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNote, togglePinNote, deleteNote } from '../app/actions/notes';
import { reorderNotes } from '../app/actions/reorder';
import ReactMarkdown from 'react-markdown';
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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Note {
    id: string;
    title: string;
    content: string;
    color: string;
    pinned: boolean;
    tags?: string;
    createdAt: string;
    updatedAt: string;
    order?: number;
}

interface NotesGridProps {
    initialNotes: Note[];
}

const colorClasses: Record<string, { bg: string; border: string }> = {
    default: { bg: 'bg-white dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
};

function SortableNoteCard({ note, onPin, onDelete }: { note: Note; onPin: (id: string) => void; onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: note.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const colors = colorClasses[note.color] || colorClasses.default;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group p-4 rounded-xl border ${colors.bg} ${colors.border} transition-shadow hover:shadow-md flex flex-col h-[200px] cursor-grab active:cursor-grabbing`}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
                    <button onClick={() => onPin(note.id)} className="p-1 text-slate-400 hover:text-blue-500">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: note.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                    </button>
                    <button onClick={() => onDelete(note.id)} className="p-1 text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-1 text-slate-600 dark:text-slate-400 text-sm">
                <ReactMarkdown>{note.content || '*No content*'}</ReactMarkdown>
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {note.tags && (
                    <div className="flex gap-1">
                        {note.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] uppercase font-bold text-slate-400 bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NotesGrid({ initialNotes }: NotesGridProps) {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>(initialNotes);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const [isPending, startTransition] = useTransition();
    const [isCreating, setIsCreating] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', color: 'default', tags: '' });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setNotes((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger server reorder
                const reorderedData = newItems.map((item, index) => ({ id: item.id, order: index }));
                startTransition(() => {
                    reorderNotes(reorderedData);
                });

                return newItems;
            });
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.title.trim()) return;

        const formData = new FormData();
        formData.append('title', newNote.title);
        formData.append('content', newNote.content);
        formData.append('color', newNote.color);
        formData.append('tags', newNote.tags);

        startTransition(async () => {
            await createNote(formData);
            setNewNote({ title: '', content: '', color: 'default', tags: '' });
            setIsCreating(false);
            router.refresh();
        });
    };

    const handlePin = async (id: string) => {
        startTransition(async () => {
            await togglePinNote(id);
            setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
        });
    };

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            await deleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
        });
    };

    const pinnedNotes = notes.filter(n => n.pinned);
    const otherNotes = notes.filter(n => !n.pinned);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Notes</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{notes.length} notes</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Note
                </button>
            </div>

            {/* Create Note Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreate} className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">New Note</h2>
                        <input
                            type="text"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            placeholder="Title"
                            className="w-full h-11 px-4 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                            autoFocus
                        />
                        <textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Write your note (Markdown supported!)..."
                            rows={4}
                            className="w-full px-4 py-3 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none font-mono text-sm"
                        />
                        <input
                            type="text"
                            value={newNote.tags}
                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                            placeholder="Tags (e.g. Work, Ideas)"
                            className="w-full h-10 px-4 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        />
                        <div className="flex gap-2 mb-4">
                            {Object.keys(colorClasses).map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewNote({ ...newNote, color })}
                                    className={`w-7 h-7 rounded-full border-2 ${colorClasses[color].bg} ${newNote.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || !newNote.title.trim()}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {/* Pinned Notes - Not draggable for simplicity or separate context */}
                {pinnedNotes.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pinned</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pinnedNotes.map((note) => (
                                <div key={note.id} className="relative">
                                    {/* Reusing styling roughly by creating a one-off non-draggable card or using SortableNoteCard but disconnected? 
                                        Let's just use the SortableNoteCard but it won't be sortable since not in Context. 
                                        Basically it will render but dnd props might be inactive.
                                     */}
                                    <SortableNoteCard note={note} onPin={handlePin} onDelete={handleDelete} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {otherNotes.length > 0 && (
                    <div>
                        {pinnedNotes.length > 0 && (
                            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Others</h2>
                        )}
                        <SortableContext items={otherNotes} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {otherNotes.map((note) => (
                                    <SortableNoteCard key={note.id} note={note} onPin={handlePin} onDelete={handleDelete} />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                )}

                {/* Empty State */}
                {notes.length === 0 && (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-3">note_stack</span>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">No notes yet</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Create your first note
                        </button>
                    </div>
                )}
            </DndContext>
        </div>
    );
}
