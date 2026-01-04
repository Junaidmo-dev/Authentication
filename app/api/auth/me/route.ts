import { NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
    const session = await verifySession();

    if (!session?.userId) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
        },
    });

    if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json(user);
}
