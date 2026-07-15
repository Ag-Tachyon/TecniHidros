"use client";
import { useEffect, useState } from 'react';

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);

    // Estados para el formulario de registro
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [direccion, setDireccion] = useState('');

    // Estados para el manejo de teléfonos
    const [telefonoTexto, setTelefonoTexto] = useState('');
    const [telefonosSeleccionados, setTelefonosSeleccionados] = useState([]);

    const cargarClientes = () => {
        fetch('/api/clientes')
            .then(res => res.json())
            .then(data => setClientes(data));
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const agregarTelefono = () => {
        if (!telefonoTexto.trim()) return;
        setTelefonosSeleccionados(prev => [...prev, telefonoTexto.trim()]);
        setTelefonoTexto('');
    };

    const quitarTelefono = (index) => {
        setTelefonosSeleccionados(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nuevoCliente = {
            nombreCliente: nombre,
            documentoCliente: documento,
            direccionCliente: direccion,
            telefonos: telefonosSeleccionados
        };

        const res = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente)
        });

        if (res.ok) {
            // Limpiamos los campos
            setNombre('');
            setDocumento('');
            setDireccion('');
            setTelefonosSeleccionados([]);
            // Recargamos la lista visualmente
            cargarClientes();
        } else {
            const err = await res.json();
            alert(err.error || 'Hubo un error al registrar al cliente.');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Clientes</h1>

            {/* FORMULARIO DE REGISTRO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
                <h2 className="text-xl font-semibold mb-5 text-blue-700">Registrar Nuevo Cliente</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col md:flex-row gap-5 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                            <input
                                type="text"
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Residencia</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Sección de Teléfonos */}
                    <div className="pt-4 border-t">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfonos de contacto</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={telefonoTexto}
                                onChange={(e) => setTelefonoTexto(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarTelefono(); } }}
                                placeholder="Ej: 3001234567"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={agregarTelefono}
                                className="bg-gray-200 text-gray-700 px-5 rounded-lg text-sm font-bold hover:bg-gray-300"
                            >
                                + Agregar
                            </button>
                        </div>

                        {telefonosSeleccionados.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {telefonosSeleccionados.map((tel, i) => (
                                    <span
                                        key={i}
                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1 rounded-full"
                                    >
                                        {tel}
                                        <button
                                            type="button"
                                            onClick={() => quitarTelefono(i)}
                                            className="text-blue-400 hover:text-red-500 font-bold"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full md:w-auto h-[42px] self-start"
                    >
                        Guardar
                    </button>
                </form>
            </div>

            {/* LISTADO DE CLIENTES */}
            {clientes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No hay clientes registrados aún.</p>
                    <p className="text-sm text-gray-400 mt-1">Ingresa los datos en el formulario para añadir el primero.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientes.map((cliente) => (
                        <div
                            key={cliente.codCliente}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold text-gray-800">{cliente.nombreCliente}</h2>
                                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    ID: {cliente.codCliente}
                                </span>
                            </div>
                            <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Doc:</span> {cliente.documentoCliente}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium text-gray-800">Dirección:</span> {cliente.direccionCliente}
                            </p>
                            {cliente.telefonos && (
                                <p className="text-gray-600">
                                    <span className="font-medium text-gray-800">Teléfonos:</span> {cliente.telefonos.split('||').join(', ')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}