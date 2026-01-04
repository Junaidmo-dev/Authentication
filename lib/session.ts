import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_me');

const cookieName = 'secure_dash_session';

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(key);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ userId, expires });

    const cookieStore = await cookies();
    cookieStore.set(cookieName, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(cookieName)?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
        // redirect('/login'); // Don't redirect here, let middleware or page handle it
        return null;
    }
    return { userId: session.userId as string };
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
}
