"use client";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const enlaces = [
    { href: '/', label: 'Inicio' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/empleados', label: 'Empleados' },
    { href: '/maquinas', label: 'Máquinas' },
    { href: '/ordenes', label: 'Órdenes' },
    { href: '/repuestos', label: 'Repuestos' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    // No mostrar el navbar en la pantalla de login
    if (pathname === '/login') return null;

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <span className="font-bold text-blue-700 text-lg">TecnihidroS</span>
                <div className="flex gap-4">
                    {enlaces.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${
                                pathname === link.href
                                    ? 'text-blue-700'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 font-medium"
            >
                Cerrar sesión
            </button>
        </nav>
    );
}