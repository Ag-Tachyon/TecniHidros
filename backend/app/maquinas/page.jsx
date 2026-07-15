"use client";
import { useEffect, useState } from 'react';

export default function MaquinasPage() {
    const [maquinas, setMaquinas] = useState([]);
    const [clientes, setClientes] = useState([]); // <-- NUEVO: Estado para los clientes
    
    const [nombre, setNombre] = useState('');
    const [serie, setSerie] = useState('');
    const [clienteId, setClienteId] = useState('');

    const cargarDatos = () => {
        // Pedimos las máquinas
        fetch('/api/maquinas')
            .then(res => res.json())
            .then(data => setMaquinas(data));
        
        // <-- NUEVO: Pedimos la lista de clientes para llenar el selector
        fetch('/api/clientes')
            .then(res => res.json())
            .then(data => setClientes(data));
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const nuevaMaquina = {
            nombreMaquina: nombre,
            numSerie: serie,
            cliente_codCliente: clienteId
        };

        const res = await fetch('/api/maquinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMaquina)
        });

        if (res.ok) {
            setNombre('');
            setSerie('');
            setClienteId('');
            cargarDatos();
        } else {
            alert('Hubo un error al guardar.');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Máquinas</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
                <h2 className="text-xl font-semibold mb-5 text-blue-700">Registrar Nueva Máquina</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-5 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input 
                            type="text" 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required 
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">N° de Serie</label>
                        <input 
                            type="text" 
                            value={serie}
                            onChange={(e) => setSerie(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required 
                        />
                    </div>

                    {/* ---------- AQUI ESTÁ LA MAGIA DEL SELECT ---------- */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dueño (Cliente)</label>
                        <select 
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Selecciona un cliente...</option>
                            {clientes.map(cliente => (
                                <option key={cliente.codCliente} value={cliente.codCliente}>
                                    {cliente.nombreCliente} (ID: {cliente.codCliente})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* ---------------------------------------------------- */}
                    
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full md:w-auto h-[42px]">
                        Guardar
                    </button>
                </form>
            </div>

            {/* ... (El resto del código de la cuadrícula queda exactamente igual) ... */}
            
        </div>
    );
}