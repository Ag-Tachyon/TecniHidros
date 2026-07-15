import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const [repuestos] = await db.query('SELECT * FROM repuesto');
        return NextResponse.json(repuestos);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener repuestos' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nombreRepuesto, valorVentaRepuesto, cantStock, descripRepuesto } = await request.json();
        const [resultado] = await db.query(
            'INSERT INTO repuesto (nombreRepuesto, valorVentaRepuesto, cantStock, descripRepuesto) VALUES (?, ?, ?, ?)',
            [nombreRepuesto, valorVentaRepuesto, cantStock, descripRepuesto]
        );
        return NextResponse.json({ success: true, id: resultado.insertId });
    } catch (error) {
        return NextResponse.json({ error: 'Error al registrar repuesto' }, { status: 500 });
    }
}