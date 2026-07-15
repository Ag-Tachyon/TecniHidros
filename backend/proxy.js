import { NextResponse } from 'next/server';
import { verificarToken } from '@/lib/auth';

const rutasPublicas = ['/login', '/api/login'];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    if (rutasPublicas.some(ruta => pathname.startsWith(ruta))) {
        return NextResponse.next();
    }

    const token = request.cookies.get('session')?.value;
    const payload = token ? await verificarToken(token) : null;

    if (!payload) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};