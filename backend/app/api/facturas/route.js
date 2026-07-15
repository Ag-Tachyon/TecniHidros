import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Obtener todas las facturas (con cliente y garantía asociada)
export async function GET() {
    try {
        const [facturas] = await db.query(`
            SELECT fa.*, c.nombreCliente, 
                g.codGarantia, g.fechaVencimiento, g.estadoGarantia, g.condicion
            FROM factura fa
            LEFT JOIN cliente c ON fa.cliente_codCliente = c.codCliente
            LEFT JOIN garantia g ON g.factura_codFactura = fa.codFactura
            ORDER BY fa.codFactura DESC
        `);
        return NextResponse.json(facturas);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 });
    }
}

// Crear factura (con garantía automática) a partir de una orden
export async function POST(request) {
    const conn = await db.getConnection();
    try {
        const body = await request.json();
        const { ordenServicio_codServicio, mesesGarantia = 3, condicionGarantia = '' } = body;

        await conn.beginTransaction();

        // 1. Evitar doble facturación de la misma orden
        const [[facturaExistente]] = await conn.query(
            'SELECT codFactura FROM factura WHERE ordenServicio_codServicio = ?',
            [ordenServicio_codServicio]
        );
        if (facturaExistente) {
            throw new Error('Esta orden ya tiene una factura registrada');
        }

        // 2. Obtener el cliente dueño de la máquina de esa orden
        const [[datosOrden]] = await conn.query(`
            SELECT ma.cliente_codCliente
            FROM ordenServicio o
            JOIN maquina ma ON o.maquina_codMaquina = ma.codMaquina
            WHERE o.codServicio = ?
        `, [ordenServicio_codServicio]);

        if (!datosOrden) {
            throw new Error('No se encontró la orden o su máquina asociada');
        }

        // 3. Calcular el valor de los repuestos usados en la orden
        const [[totales]] = await conn.query(`
            SELECT COALESCE(SUM(u.cantRepuestosUsados * r.valorVentaRepuesto), 0) AS total
            FROM usa u
            JOIN repuesto r ON u.repuesto_codRepuesto = r.codRepuesto
            WHERE u.ordenServicio_codServicio = ?
        `, [ordenServicio_codServicio]);

        const valorRepuestosUsados = totales.total;
        const valTotal = valorRepuestosUsados; // valTotal = solo repuestos, por ahora

        // 4. Crear la factura
        const [resultadoFactura] = await conn.query(
            'INSERT INTO factura (valorRepuestosUsados, fecha, valTotal, cliente_codCliente, ordenServicio_codServicio) VALUES (?, NOW(), ?, ?, ?)',
            [valorRepuestosUsados, valTotal, datosOrden.cliente_codCliente, ordenServicio_codServicio]
        );
        const nuevaFacturaId = resultadoFactura.insertId;

        // 5. Crear la garantía automáticamente
        await conn.query(
            'INSERT INTO garantia (fechaVencimiento, estadoGarantia, condicion, factura_codFactura) VALUES (DATE_ADD(CURDATE(), INTERVAL ? MONTH), ?, ?, ?)',
            [mesesGarantia, 'Activa', condicionGarantia, nuevaFacturaId]
        );

        await conn.commit();
        return NextResponse.json({ success: true, id: nuevaFacturaId });

    } catch (error) {
        await conn.rollback();
        console.error("Error en POST facturas:", error);
        return NextResponse.json({ error: error.message || 'Error al generar factura' }, { status: 500 });
    } finally {
        conn.release();
    }
}