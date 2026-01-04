'use server';

import { prisma } from '../../lib/prisma';
import { verifySession } from '../../lib/session';
import { revalidatePath } from 'next/cache';

// Get all notes for current user
export async function getNotes() {
    const session = await verifySession();
    if (!session) return [];

    const notes = await prisma.note.findMany({
        where: { userId: session.userId },
        orderBy: [
            { pinned: 'desc' },
            { order: 'asc' },
            { updatedAt: 'desc' }
        ],
    });

    return notes;
}

// Create a new note
export async function createNote(formData: FormData) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const color = (formData.get('color') as string) || 'default';
    const tags = formData.get('tags') as string;

    if (!title?.trim()) {
        return { error: 'Title is required' };
    }

    // Get highest order
    const lastNote = await prisma.note.findFirst({
        where: { userId: session.userId },
        orderBy: { order: 'desc' },
    });
    const newOrder = lastNote ? lastNote.order + 1 : 0;

    await prisma.note.create({
        data: {
            title: title.trim(),
            content: content?.trim() || '',
            color,
            pinned: false,
            tags: tags?.trim() || '',
            order: newOrder,
            userId: session.userId,
        },
    });

    revalidatePath('/notes');
    return { success: true };
}

// Toggle note pinned status
export async function togglePinNote(id: string) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== session.userId) {
        return { error: 'Not found' };
    }

    await prisma.note.update({
        where: { id },
        data: { pinned: !note.pinned },
    });

    revalidatePath('/notes');
    return { success: true };
}

// Delete a note
export async function deleteNote(id: string) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== session.userId) {
        return { error: 'Not found' };
    }

    await prisma.note.delete({ where: { id } });

    revalidatePath('/notes');
    return { success: true };
}

// Update note
export async function updateNote(id: string, formData: FormData) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== session.userId) {
        return { error: 'Not found' };
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const color = formData.get('color') as string;

    await prisma.note.update({
        where: { id },
        data: {
            title: title?.trim() || note.title,
            content: content !== null ? content : note.content,
            color: color || note.color,
        },
    });

    revalidatePath('/notes');
    return { success: true };
}
