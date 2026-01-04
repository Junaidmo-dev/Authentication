'use server';

import { prisma } from '../../lib/prisma';
import { verifySession } from '../../lib/session';
import { revalidatePath } from 'next/cache';

// Get all todos for current user
export async function getTodos() {
    const session = await verifySession();
    if (!session) return [];

    const todos = await prisma.todo.findMany({
        where: { userId: session.userId },
        orderBy: [{ order: 'asc' }, { completed: 'asc' }, { createdAt: 'desc' }],
    });

    return todos;
}

// Create a new todo
export async function createTodo(formData: FormData) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const title = formData.get('title') as string;
    const priority = (formData.get('priority') as string) || 'medium';
    const dueDateStr = formData.get('dueDate') as string;
    const tags = formData.get('tags') as string;

    if (!title?.trim()) {
        return { error: 'Title is required' };
    }

    // Get highest order to append to bottom
    const lastTodo = await prisma.todo.findFirst({
        where: { userId: session.userId },
        orderBy: { order: 'desc' },
    });
    const newOrder = lastTodo ? lastTodo.order + 1 : 0;

    await prisma.todo.create({
        data: {
            title: title.trim(),
            priority,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            tags: tags?.trim() || '',
            order: newOrder,
            userId: session.userId,
        },
    });

    revalidatePath('/todos');
    return { success: true };
}

// Toggle todo completion
export async function toggleTodo(id: string) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo || todo.userId !== session.userId) {
        return { error: 'Not found' };
    }

    await prisma.todo.update({
        where: { id },
        data: { completed: !todo.completed },
    });

    revalidatePath('/todos');
    return { success: true };
}

// Delete a todo
export async function deleteTodo(id: string) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo || todo.userId !== session.userId) {
        return { error: 'Not found' };
    }

    await prisma.todo.delete({ where: { id } });

    revalidatePath('/todos');
    return { success: true };
}

// Update todo
export async function updateTodo(id: string, formData: FormData) {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo || todo.userId !== session.userId) {
        return { error: 'Not found' };
    }

    const title = formData.get('title') as string;
    const priority = formData.get('priority') as string;
    const dueDateStr = formData.get('dueDate') as string;

    await prisma.todo.update({
        where: { id },
        data: {
            title: title?.trim() || todo.title,
            priority: priority || todo.priority,
            dueDate: dueDateStr ? new Date(dueDateStr) : todo.dueDate,
        },
    });

    revalidatePath('/todos');
    return { success: true };
}
