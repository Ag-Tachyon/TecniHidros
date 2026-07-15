import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { crearToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const { usuario, password } = await request.json();

        const usuarioValido = usuario === process.env.ADMIN_USER;
        const passwordValido = usuarioValido && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

        if (!usuarioValido || !passwordValido) {
            return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
        }

        const token = await crearToken({ usuario });

        const response = NextResponse.json({ success: true });
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 8, // 8 horas
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
    }
}