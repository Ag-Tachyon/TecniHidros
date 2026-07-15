"use client";
import { useEffect, useState } from 'react';

export default function OrdenesPage() {
    const [ordenes, setOrdenes] = useState([]);
    const [maquinas, setMaquinas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [repuestosSeleccionados, setRepuestosSeleccionados] = useState([]);
    const [fallaTexto, setFallaTexto] = useState('');
    const [fallasSeleccionadas, setFallasSeleccionadas] = useState([]);

    const [maquinaId, setMaquinaId] = useState('');
    const [empleadoId, setEmpleadoId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [estado, setEstado] = useState('En Revision');
    const [diagnostico, setDiagnostico] = useState('');

    // Estado para el formulario de facturación (por orden)
    const [ordenFacturando, setOrdenFacturando] = useState(null); // codServicio de la orden en proceso
    const [mesesGarantia, setMesesGarantia] = useState(3);
    const [condicionGarantia, setCondicionGarantia] = useState('');

    const cargarDatos = async () => {
        try {
            const [resM, resE, resR, resO] = await Promise.all([
                fetch('/api/maquinas'),
                fetch('/api/empleados'),
                fetch('/api/repuestos'),
                fetch('/api/ordenes'),
            ]);

            if (!resM.ok) console.error("Error cargando Máquinas");
            if (!resE.ok) console.error("Error cargando Empleados");
            if (!resR.ok) console.error("Error cargando Repuestos");
            if (!resO.ok) console.error("Error cargando Órdenes");

            setMaquinas(await resM.json());
            setEmpleados(await resE.json());
            setRepuestos(await resR.json());
            setOrdenes(await resO.json());
        } catch (error) {
            console.error("Error fatal en carga:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const agregarRepuestoAlCarrito = (repuestoId) => {
        if (!repuestoId) return;
        const rep = repuestos.find(r => r.codRepuesto == repuestoId);
        if (!rep) return;

        setRepuestosSeleccionados(prev => {
            const existente = prev.find(r => r.codRepuesto == repuestoId);
            if (existente) {
                return prev.map(r =>
                    r.codRepuesto == repuestoId ? { ...r, cantidad: r.cantidad + 1 } : r
                );
            }
            return [...prev, { ...rep, cantidad: 1 }];
        });
    };

    const actualizarCantidad = (repuestoId, cantidad) => {
        const cantidadNum = Math.max(1, parseInt(cantidad) || 1);
        setRepuestosSeleccionados(prev =>
            prev.map(r => r.codRepuesto == repuestoId ? { ...r, cantidad: cantidadNum } : r)
        );
    };

    const quitarRepuesto = (repuestoId) => {
        setRepuestosSeleccionados(prev => prev.filter(r => r.codRepuesto != repuestoId));
    };

    const agregarFalla = () => {
        if (!fallaTexto.trim()) return;
        setFallasSeleccionadas(prev => [...prev, fallaTexto.trim()]);
        setFallaTexto('');
    };

    const quitarFalla = (index) => {
        setFallasSeleccionadas(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/ordenes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maquina_codMaquina: maquinaId,
                    empleado_codEmpleado: empleadoId,
                    fechaIngresoMaquina: fecha,
                    estadoReparacion: estado,
                    diagnosticoReparacion: diagnostico,
                    repuestos: repuestosSeleccionados.map(r => ({
                        codRepuesto: r.codRepuesto,
                        cantidad: r.cantidad
                    })),
                    fallas: fallasSeleccionadas
                })
            });

            if (res.ok) {
                setMaquinaId('');
                setEmpleadoId('');
                setDiagnostico('');
                setRepuestosSeleccionados([]);
                setFallasSeleccionadas([]);
                cargarDatos();
            } else {
                const err = await res.json();
                alert(err.error || 'Error al crear la orden');
            }
        } catch (error) {
            console.error("Error al crear orden:", error);
        }
    };

    // Abre/cierra el mini-formulario de facturación de una orden
    const toggleFacturar = (codServicio) => {
        setOrdenFacturando(prev => prev === codServicio ? null : codServicio);
        setMesesGarantia(3);
        setCondicionGarantia('');
    };

    const confirmarFactura = async (codServicio) => {
        try {
            const res = await fetch('/api/facturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ordenServicio_codServicio: codServicio,
                    mesesGarantia: parseInt(mesesGarantia) || 3,
                    condicionGarantia
                })
            });

            if (res.ok) {
                setOrdenFacturando(null);
                cargarDatos(); // Refresca para mostrar la orden ya facturada
            } else {
                const err = await res.json();
                alert(err.error || 'Error al generar la factura');
            }
        } catch (error) {
            console.error("Error al facturar:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Órdenes de Servicio</h1>

            {/* FORMULARIO DE APERTURA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
                <h2 className="text-xl font-semibold mb-6 text-blue-700 border-b pb-2">Apertura de Orden</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
                            <select value={maquinaId} onChange={e => setMaquinaId(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" required>
                                <option value="">Seleccione máquina...</option>
                                {maquinas.map(m => <option key={m.codMaquina} value={m.codMaquina}>{m.nombreMaquina} ({m.numSerie})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Responsable</label>
                            <select value={empleadoId} onChange={e => setEmpleadoId(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" required>
                                <option value="">Seleccione técnico...</option>
                                {empleados.map(e => <option key={e.codEmpleado} value={e.codEmpleado}>{e.nombreEmpleado}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" required />
                        </div>
                    </div>

                    {/* Fallas */}
                    <div className="mt-4 pt-4 border-t">
                        <label className="text-xs font-bold text-gray-500 uppercase">Fallas Detectadas:</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={fallaTexto}
                                onChange={e => setFallaTexto(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarFalla(); } }}
                                placeholder="Ej: Motor no enciende..."
                                className="text-sm border rounded p-2 flex-1"
                            />
                            <button type="button" onClick={agregarFalla} className="bg-gray-200 text-gray-700 px-4 rounded-lg text-sm font-bold hover:bg-gray-300">
                                + Agregar
                            </button>
                        </div>

                        {fallasSeleccionadas.length > 0 && (
                            <ul className="mt-3 space-y-1">
                                {fallasSeleccionadas.map((f, i) => (
                                    <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                                        <span>{f}</span>
                                        <button type="button" onClick={() => quitarFalla(i)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Repuestos */}
                    <div className="mt-4 pt-4 border-t">
                        <label className="text-xs font-bold text-gray-500 uppercase">Agregar Repuesto:</label>
                        <div className="flex gap-2 mt-1">
                            <select className="text-sm border rounded p-1 flex-1" value="" onChange={(e) => agregarRepuestoAlCarrito(e.target.value)}>
                                <option value="">Seleccionar repuesto...</option>
                                {repuestos.map(r => (
                                    <option key={r.codRepuesto} value={r.codRepuesto}>
                                        {r.nombreRepuesto} (Stock: {r.cantStock})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {repuestosSeleccionados.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {repuestosSeleccionados.map(r => (
                                    <div key={r.codRepuesto} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                                        <span>{r.nombreRepuesto}</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={r.cantidad}
                                                onChange={(e) => actualizarCantidad(r.codRepuesto, e.target.value)}
                                                className="w-16 border rounded p-1 text-center"
                                            />
                                            <button type="button" onClick={() => quitarRepuesto(r.codRepuesto)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Inicial</label>
                        <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 h-24" placeholder="Describa el estado general de la máquina..." />
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        Crear Orden de Servicio
                    </button>
                </form>
            </div>

            {/* LISTADO DE ÓRDENES ACTIVAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {ordenes && ordenes.length > 0 ? (
                    ordenes.map(orden => (
                        <div key={orden.codServicio} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-8 border-l-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Orden #{orden.codServicio}</h3>
                                    <p className="text-sm text-gray-500">
                                        {orden.fechaIngresoMaquina ? new Date(orden.fechaIngresoMaquina).toLocaleDateString() : 'Sin fecha'}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {orden.estadoReparacion}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-gray-700 text-sm"><span className="font-bold">Máquina:</span> {orden.nombreMaquina || 'No asignada'}</p>
                                <p className="text-gray-700 text-sm"><span className="font-bold">Técnico:</span> {orden.nombreEmpleado || 'No asignado'}</p>
                            </div>

                            {orden.fallas && (
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fallas:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {orden.fallas.split('||').map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 italic">"{orden.diagnosticoReparacion || 'Sin diagnóstico'}"</p>
                            </div>

                            {/* Sección de Facturación / Garantía */}
                            {orden.codFactura ? (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
                                    <p className="font-bold text-green-800">✓ Facturada — Factura #{orden.codFactura}</p>
                                    <p className="text-gray-700">Total: ${Number(orden.valTotal).toLocaleString()}</p>
                                    {orden.fechaVencimientoGarantia && (
                                        <p className="text-gray-700">
                                            Garantía ({orden.estadoGarantia}) vence: {new Date(orden.fechaVencimientoGarantia).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => toggleFacturar(orden.codServicio)}
                                        className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-900"
                                    >
                                        {ordenFacturando === orden.codServicio ? 'Cancelar' : 'Generar Factura'}
                                    </button>

                                    {ordenFacturando === orden.codServicio && (
                                        <div className="mt-3 p-3 border rounded-lg space-y-3 bg-gray-50">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meses de garantía</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={mesesGarantia}
                                                    onChange={e => setMesesGarantia(e.target.value)}
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condición de la garantía</label>
                                                <textarea
                                                    value={condicionGarantia}
                                                    onChange={e => setCondicionGarantia(e.target.value)}
                                                    placeholder="Ej: Cubre mano de obra y repuestos instalados..."
                                                    className="w-full p-2 border rounded-lg text-sm h-16"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => confirmarFactura(orden.codServicio)}
                                                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                                            >
                                                Confirmar Factura y Garantía
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 p-10 text-center border-2 border-dashed rounded-2xl text-gray-400">
                        No hay órdenes de servicio registradas aún.
                    </div>
                )}
            </div>
        </div>
    );
}