'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        documento: '',
        nombres: '',
        apellidos: '',
        correo: '',
        direccion: '',
        telefono: '',
        tipo_doc: 'CC',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al registrarse');
                setLoading(false);
                return;
            }

            // Redirigir al login
            router.push('/');
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed py-10"
            style={{
                backgroundImage: `url('https://res.cloudinary.com/dil3rjo71/image/upload/v1764564438/senasede_45596492_20240716115731_kwukml.jpg')`
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="relative z-10 w-full max-w-2xl px-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <img
                                src="https://res.cloudinary.com/dil3rjo71/image/upload/v1763990215/logo-de-Sena-sin-fondo-Blanco-300x300_tlss3c.webp"
                                alt="SENA Logo"
                                className="h-16 w-16 object-contain bg-[#39A900] rounded-full p-2 shadow-lg"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-[#39A900] mb-2">SENA</h1>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
                        <p className="text-gray-600 font-medium">Completa el formulario para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tipo de Documento */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Documento</label>
                                <select
                                    name="tipo_doc"
                                    value={formData.tipo_doc}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>

                            {/* Documento */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Número de Documento</label>
                                <input
                                    type="number"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Nombres */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombres</label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Apellidos */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apellidos</label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Correo */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
                                <input
                                    type="number"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dirección</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] outline-none bg-white/50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#39A900] text-white font-bold py-3.5 rounded-lg hover:bg-[#007832] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registrando...
                                </>
                            ) : (
                                'Registrarse'
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link href="/" className="text-[#007832] hover:text-[#39A900] font-bold transition underline decoration-2 underline-offset-2">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
