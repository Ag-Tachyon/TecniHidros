import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Obtener todas las fallas registradas (con su orden asociada)
export async function GET() {
    try {
        const [fallas] = await db.query(`
            SELECT f.*, o.codServicio 
            FROM fallasMaquina f
            LEFT JOIN ordenServicio o ON f.ordenServicio_codServicio = o.codServicio
        `);
        return NextResponse.json(fallas);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener fallas' }, { status: 500 });
    }
}

// Agregar una falla suelta a una orden ya existente
export async function POST(request) {
    try {
        const data = await request.json();
        const { descripFalla, ordenServicio_codServicio } = data;

        const [resultado] = await db.query(
            'INSERT INTO fallasMaquina (descripFalla, ordenServicio_codServicio) VALUES (?, ?)',
            [descripFalla, ordenServicio_codServicio]
        );

        return NextResponse.json({ success: true, id: resultado.insertId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al registrar la falla' }, { status: 500 });
    }
}