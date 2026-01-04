'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { createSession, deleteSession } from '../../lib/session';
import { redirect } from 'next/navigation';

const SignupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' }),
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type FormState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        general?: string[];
    };
    message?: string;
};

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = SignupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Account.',
        };
    }

    const { name, email, password } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return {
                errors: { email: ['Email already exists.'] },
                message: 'Failed to Create Account.',
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        await createSession(user.id);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Account.',
        };
    }

    redirect('/');
}

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields.',
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                message: 'USER_NOT_FOUND',
            };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return {
                message: 'Invalid credentials.',
            };
        }

        await createSession(user.id);
    } catch (error) {
        return {
            message: 'Something went wrong.',
        };
    }

    redirect('/');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
