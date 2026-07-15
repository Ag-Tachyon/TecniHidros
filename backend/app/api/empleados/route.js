import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const [empleados] = await db.query('SELECT * FROM empleado');
        return NextResponse.json(empleados);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener empleados' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { nombreEmpleado, especializacionEmp } = data;

        const [resultado] = await db.query(
            'INSERT INTO empleado (nombreEmpleado, especializacionEmp) VALUES (?, ?)',
            [nombreEmpleado, especializacionEmp]
        );

        return NextResponse.json({ success: true, id: resultado.insertId });
    } catch (error) {
        return NextResponse.json({ error: 'Error al registrar empleado' }, { status: 500 });
    }
}