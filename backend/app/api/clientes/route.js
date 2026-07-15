import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Obtener todos los clientes registrados (con sus teléfonos agrupados)
export async function GET() {
    try {
        const [clientes] = await db.query(`
            SELECT c.*, 
                GROUP_CONCAT(t.telefono SEPARATOR '||') AS telefonos
            FROM cliente c
            LEFT JOIN telefonosCliente t ON t.cliente_codCliente = c.codCliente
            GROUP BY c.codCliente
            ORDER BY c.codCliente DESC
        `);
        return NextResponse.json(clientes);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
    }
}

// Crear un nuevo cliente + sus teléfonos, en una sola transacción
export async function POST(request) {
    const conn = await db.getConnection();
    try {
        const data = await request.json();
        const { nombreCliente, documentoCliente, direccionCliente, telefonos } = data;
        // telefonos esperado: ["3001234567", "6011234567", ...]

        await conn.beginTransaction();

        // 1. Crear el cliente
        const [resultado] = await conn.query(
            'INSERT INTO cliente (nombreCliente, documentoCliente, direccionCliente) VALUES (?, ?, ?)',
            [nombreCliente, documentoCliente, direccionCliente]
        );
        const nuevoClienteId = resultado.insertId;

        // 2. Insertar los teléfonos asociados
        if (Array.isArray(telefonos) && telefonos.length > 0) {
            for (const telefono of telefonos) {
                if (!telefono || !telefono.trim()) continue;
                await conn.query(
                    'INSERT INTO telefonosCliente (telefono, cliente_codCliente) VALUES (?, ?)',
                    [telefono.trim(), nuevoClienteId]
                );
            }
        }

        await conn.commit();
        return NextResponse.json({ success: true, id: nuevoClienteId });

    } catch (error) {
        await conn.rollback();
        console.error(error);

        // documentoCliente es UNIQUE, así que capturamos ese caso específico
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Ya existe un cliente con ese documento' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Error al registrar al cliente' }, { status: 500 });
    } finally {
        conn.release();
    }
}