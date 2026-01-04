'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNote, togglePinNote, deleteNote, updateNote } from '../app/actions/notes';
import { reorderNotes } from '../app/actions/reorder';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
    createdAt: string | Date;
    updatedAt: string | Date;
    order?: number;
}

interface NotesGridProps {
    initialNotes: Note[];
}

const colorThemes: Record<string, string> = {
    default: 'border-zinc-200 dark:border-zinc-800',
    blue: 'border-zinc-900 dark:border-zinc-100',
    green: 'border-emerald-500/50',
    yellow: 'border-amber-500/50',
    red: 'border-rose-500/50',
};

function SortableNoteCard({ note, onPin, onDelete, onEdit }: { note: Note; onPin: (id: string) => void; onDelete: (id: string) => void; onEdit: (note: Note) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: note.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0
    };

    const borderClass = colorThemes[note.color] || colorThemes.default;

    return (
        <motion.div
            layout
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`group p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border ${borderClass} ${isDragging ? 'shadow-2xl' : 'shadow-soft'} hover:shadow-xl transition-shadow flex flex-col h-[280px] cursor-grab active:cursor-grabbing relative overflow-hidden`}
        >
            <div className="flex items-start justify-between mb-4 relative z-10">
                <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-50 tracking-tight line-clamp-2 uppercase italic">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
                    <button onClick={() => onEdit(note)} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => onPin(note.id)} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: note.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                    </button>
                    <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-1 text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed relative z-10">
                <ReactMarkdown>{note.content || '*N/A*'}</ReactMarkdown>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    UPDATED: {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {note.tags && (
                    <div className="flex gap-1">
                        {note.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-100 dark:border-zinc-800 px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute -bottom-4 -right-4 text-[100px] font-black opacity-[0.02] dark:opacity-[0.05] italic select-none pointer-events-none">
                {note.order || 0}
            </div>
        </motion.div>
    );
}

export default function NotesGrid({ initialNotes }: NotesGridProps) {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [isPending, startTransition] = useTransition();
    const [modalState, setModalState] = useState<{ type: 'create' | 'edit' | null, note?: Note }>({ type: null });
    const [noteForm, setNoteForm] = useState({ title: '', content: '', color: 'default', tags: '' });

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setNotes((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                const reorderedData = newItems.map((item, index) => ({ id: item.id, order: index }));
                startTransition(() => {
                    reorderNotes(reorderedData);
                });
                return newItems;
            });
        }
    };

    const handleOpenEdit = (note: Note) => {
        setNoteForm({ title: note.title, content: note.content, color: note.color, tags: note.tags || '' });
        setModalState({ type: 'edit', note });
    };

    const handleOpenCreate = () => {
        setNoteForm({ title: '', content: '', color: 'default', tags: '' });
        setModalState({ type: 'create' });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteForm.title.trim()) return;

        const formData = new FormData();
        formData.append('title', noteForm.title);
        formData.append('content', noteForm.content);
        formData.append('color', noteForm.color);
        formData.append('tags', noteForm.tags);

        startTransition(async () => {
            if (modalState.type === 'edit' && modalState.note) {
                await updateNote(modalState.note.id, formData);
            } else {
                await createNote(formData);
            }
            setModalState({ type: null });
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
        <div className="max-w-6xl mx-auto py-10 px-6 space-y-12">
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Knowledge Base</h1>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{notes.length} Active Records</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Initialize Node
                </button>
            </header>

            <AnimatePresence>
                {modalState.type && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    >
                        <motion.form
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onSubmit={handleFormSubmit}
                            className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[3.5rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-6"
                        >
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter uppercase italic">
                                {modalState.type === 'edit' ? 'Update Data Node' : 'Initialize Data Node'}
                            </h2>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Descriptor</label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    placeholder="Enter node title..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none ring-zinc-900 dark:ring-zinc-100 focus:ring-1"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Information payload</label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                    placeholder="Syntax: Markdown enabled..."
                                    rows={5}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-medium outline-none ring-zinc-900 dark:ring-zinc-100 focus:ring-1 resize-none font-mono"
                                />
                            </div>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tags</label>
                                    <input
                                        type="text"
                                        value={noteForm.tags}
                                        onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest outline-none ring-zinc-900 dark:ring-zinc-100 focus:ring-1"
                                    />
                                </div>
                                <div className="flex gap-2 pb-2">
                                    {Object.keys(colorThemes).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNoteForm({ ...noteForm, color })}
                                            className={`w-6 h-6 rounded-full border-2 border-zinc-200 dark:border-zinc-700 ${colorThemes[color].replace('border-', 'bg-')} ${noteForm.color === color ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 justify-end pt-6">
                                <button type="button" onClick={() => setModalState({ type: null })} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Abort</button>
                                <button type="submit" disabled={isPending || !noteForm.title.trim()} className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                                    {isPending ? 'Syncing...' : 'Commit'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="space-y-16">
                    <LayoutGroup>
                        {pinnedNotes.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase italic">Strategic Intel</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {pinnedNotes.map((note) => (
                                            <SortableNoteCard key={note.id} note={note} onPin={handlePin} onDelete={handleDelete} onEdit={handleOpenEdit} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        )}

                        {otherNotes.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                                    <h2 className="text-xl font-black text-zinc-400 tracking-tight uppercase italic opacity-60">Archive Nodes</h2>
                                </div>
                                <SortableContext items={otherNotes} strategy={rectSortingStrategy}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {otherNotes.map((note) => (
                                                <SortableNoteCard key={note.id} note={note} onPin={handlePin} onDelete={handleDelete} onEdit={handleOpenEdit} />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </SortableContext>
                            </section>
                        )}
                    </LayoutGroup>
                </div>

                {notes.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border border-dashed border-zinc-200 dark:border-zinc-800"
                    >
                        <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-800 mb-6 opacity-40">database</span>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Database Empty: No Nodes Initialized</p>
                        <button onClick={handleOpenCreate} className="mt-8 text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50 underline underline-offset-8">Draft Initial Directive</button>
                    </motion.div>
                )}
            </DndContext>
        </div>
    );
}
