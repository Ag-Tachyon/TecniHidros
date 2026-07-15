"use client";
import { useEffect, useState } from 'react';

export default function RepuestosPage() {
    const [repuestos, setRepuestos] = useState([]);
    const [form, setForm] = useState({ nombre: '', valor: '', stock: '', desc: '' });

    const cargarRepuestos = async () => {
        const res = await fetch('/api/repuestos');
        const data = await res.json();
        setRepuestos(data);
    };

    useEffect(() => { cargarRepuestos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/repuestos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombreRepuesto: form.nombre, 
                valorVentaRepuesto: form.valor, 
                cantStock: form.stock, 
                descripRepuesto: form.desc 
            })
        });
        setForm({ nombre: '', valor: '', stock: '', desc: '' });
        cargarRepuestos();
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Gestión de Repuestos</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="border p-2 rounded" required />
                <input placeholder="Valor Venta" type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="border p-2 rounded" required />
                <input placeholder="Cantidad en Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border p-2 rounded" required />
                <input placeholder="Descripción" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="border p-2 rounded" />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded md:col-span-2">Registrar Repuesto</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {repuestos.map(r => (
                    <div key={r.codRepuesto} className="border p-4 rounded-xl shadow-sm bg-white">
                        <h3 className="font-bold text-lg">{r.nombreRepuesto}</h3>
                        <p className="text-gray-600">Stock: {r.cantStock}</p>
                        <p className="text-blue-600 font-semibold">${r.valorVentaRepuesto}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}