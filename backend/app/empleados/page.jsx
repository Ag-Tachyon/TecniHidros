"use client";
import { useEffect, useState } from 'react';

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState([]);
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    const cargarEmpleados = async () => {
        const res = await fetch('/api/empleados');
        const data = await res.json();
        setEmpleados(data);
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/empleados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreEmpleado: nombre, especializacionEmp: especialidad })
        });
        setNombre('');
        setEspecialidad('');
        cargarEmpleados();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Gestión de Empleados</h1>
            
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="border p-2 rounded text-blue-700" required />
                <input placeholder="Especialización" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="text-blue-700 border p-2 rounded" required />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Registrar</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {empleados.map(emp => (
                    <div key={emp.codEmpleado} className="border p-4 rounded shadow">
                        <h3 className="font-bold">{emp.nombreEmpleado}</h3>
                        <p className="text-sm text-gray-600">{emp.especializacionEmp}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}