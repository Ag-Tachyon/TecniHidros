import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Mantenemos tu función GET intacta para leer las máquinas
export async function GET() {
    try {
        const [maquinas] = await db.query('SELECT * FROM maquina');
        return NextResponse.json(maquinas);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener las máquinas' }, { status: 500 });
    }
}

// Nueva función POST para CREAR una máquina
export async function POST(request) {
    try {
        // Capturamos los datos que envía el formulario
        const data = await request.json();
        const { nombreMaquina, numSerie, cliente_codCliente } = data;

        // Ejecutamos la inserción en MySQL
        const [resultado] = await db.query(
            'INSERT INTO maquina (nombreMaquina, numSerie, cliente_codCliente) VALUES (?, ?, ?)',
            [nombreMaquina, numSerie, cliente_codCliente]
        );

        // Devolvemos una respuesta de éxito
        return NextResponse.json({ success: true, id: resultado.insertId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al guardar la máquina' }, { status: 500 });
    }
}