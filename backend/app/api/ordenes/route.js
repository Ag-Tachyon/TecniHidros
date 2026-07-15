import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Lectura de órdenes (con fallas agrupadas)
export async function GET() {
    try {
        const [ordenes] = await db.query(`
            SELECT o.*, m.nombreMaquina, e.nombreEmpleado,
                GROUP_CONCAT(DISTINCT f.descripFalla SEPARATOR '||') AS fallas,
                MAX(fa.codFactura) AS codFactura,
                MAX(fa.valTotal) AS valTotal,
                MAX(g.fechaVencimiento) AS fechaVencimientoGarantia,
                MAX(g.estadoGarantia) AS estadoGarantia
            FROM ordenServicio o 
            LEFT JOIN maquina m ON o.maquina_codMaquina = m.codMaquina
            LEFT JOIN empleado e ON o.empleado_codEmpleado = e.codEmpleado
            LEFT JOIN fallasMaquina f ON f.ordenServicio_codServicio = o.codServicio
            LEFT JOIN factura fa ON fa.ordenServicio_codServicio = o.codServicio
            LEFT JOIN garantia g ON g.factura_codFactura = fa.codFactura
            GROUP BY o.codServicio
            ORDER BY o.codServicio DESC
        `);
        return NextResponse.json(ordenes);
    } catch (error) {
        console.error("Error en GET:", error);
        return NextResponse.json({ error: 'Error al obtener' }, { status: 500 });
    }
}

// POST - Crear orden + fallas + repuestos usados + descuento de stock
export async function POST(request) {
    const conn = await db.getConnection();
    try {
        const body = await request.json();
        const {
            fechaIngresoMaquina,
            estadoReparacion,
            diagnosticoReparacion,
            empleado_codEmpleado,
            maquina_codMaquina,
            repuestos,  // Array esperado: [{ codRepuesto, cantidad }, ...]
            fallas      // Array esperado: ["Falla 1", "Falla 2", ...]
        } = body;

        await conn.beginTransaction();

        // 1. Crear la orden de servicio
        const [resultadoOrden] = await conn.query(
            'INSERT INTO ordenServicio (fechaIngresoMaquina, estadoReparacion, diagnosticoReparacion, empleado_codEmpleado, maquina_codMaquina) VALUES (?, ?, ?, ?, ?)',
            [fechaIngresoMaquina, estadoReparacion, diagnosticoReparacion, empleado_codEmpleado, maquina_codMaquina]
        );
        const nuevaOrdenId = resultadoOrden.insertId;

        // 2. Insertar fallas detectadas
        if (Array.isArray(fallas) && fallas.length > 0) {
            for (const descripFalla of fallas) {
                if (!descripFalla || !descripFalla.trim()) continue;
                await conn.query(
                    'INSERT INTO fallasMaquina (descripFalla, ordenServicio_codServicio) VALUES (?, ?)',
                    [descripFalla.trim(), nuevaOrdenId]
                );
            }
        }

        // 3. Insertar repuestos usados y descontar stock
        if (Array.isArray(repuestos) && repuestos.length > 0) {
            for (const item of repuestos) {
                const { codRepuesto, cantidad } = item;

                const [[repuestoActual]] = await conn.query(
                    'SELECT cantStock FROM repuesto WHERE codRepuesto = ? FOR UPDATE',
                    [codRepuesto]
                );

                if (!repuestoActual || repuestoActual.cantStock < cantidad) {
                    throw new Error(`Stock insuficiente para el repuesto ${codRepuesto}`);
                }

                await conn.query(
                    'INSERT INTO usa (repuesto_codRepuesto, ordenServicio_codServicio, cantRepuestosUsados) VALUES (?, ?, ?)',
                    [codRepuesto, nuevaOrdenId, cantidad]
                );

                await conn.query(
                    'UPDATE repuesto SET cantStock = cantStock - ? WHERE codRepuesto = ?',
                    [cantidad, codRepuesto]
                );
            }
        }

        await conn.commit();
        return NextResponse.json({ success: true, id: nuevaOrdenId });

    } catch (error) {
        await conn.rollback();
        console.error("Error en POST:", error);
        return NextResponse.json({ error: error.message || 'Error al insertar en BD' }, { status: 500 });
    } finally {
        conn.release();
    }
}