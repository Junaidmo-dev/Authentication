'use server';

import { prisma } from '../../lib/prisma';
import { verifySession } from '../../lib/session';
import { revalidatePath } from 'next/cache';

export async function reorderTodos(items: { id: string; order: number }[]) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    // In a real app, perform this in a transaction
    try {
        for (const item of items) {
            await prisma.todo.update({
                where: { id: item.id, userId: session.userId }, // Ensure ownership
                data: { order: item.order },
            });
        }
        revalidatePath('/todos');
        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { error: 'Failed to reorder' };
    }
}

export async function reorderNotes(items: { id: string; order: number }[]) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    try {
        for (const item of items) {
            await prisma.note.update({
                where: { id: item.id, userId: session.userId },
                data: { order: item.order },
            });
        }
        revalidatePath('/notes');
        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { error: 'Failed to reorder' };
    }
}
