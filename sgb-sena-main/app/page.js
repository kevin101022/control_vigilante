'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    documento: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Guardar usuario en localStorage (temporal, luego usarás JWT)
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir al dashboard
      router.push('/dashboard');
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
    setError(''); // Limpiar error al escribir
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dil3rjo71/image/upload/v1764564438/senasede_45596492_20240716115731_kwukml.jpg')`
      }}
    >
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">

          {/* Header del Card */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="https://res.cloudinary.com/dil3rjo71/image/upload/v1763990215/logo-de-Sena-sin-fondo-Blanco-300x300_tlss3c.webp"
                alt="SENA Logo"
                className="h-20 w-20 object-contain bg-[#39A900] rounded-full p-2 shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-[#39A900] mb-2">SENA</h1>
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Bienes</h2>
            <p className="text-gray-600 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            {/* Campo de Documento */}
            <div>
              <label htmlFor="documento" className="block text-sm font-bold text-gray-700 mb-2">
                Número de Documento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.95 2-2.122 2H12m-2.122 0c-1.172 0-2.122-1.116-2.122-2"></path></svg>
                </div>
                <input
                  type="text"
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900 bg-white/50 focus:bg-white"
                  placeholder="Ej: 1000123456"
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition text-gray-900 bg-white/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Recordar y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#39A900] border-gray-300 rounded focus:ring-[#39A900]"
                />
                <span className="ml-2 text-sm text-gray-600 font-medium">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-[#007832] hover:text-[#39A900] font-bold transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39A900] text-white font-bold py-3.5 rounded-lg hover:bg-[#007832] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-[#007832] hover:text-[#39A900] font-bold transition underline decoration-2 underline-offset-2">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer simple */}
        <div className="mt-8 text-center text-white/80 text-sm font-medium">
          <p>© {new Date().getFullYear()} SENA - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}
