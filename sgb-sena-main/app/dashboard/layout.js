'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import RoleSwitcher from '@/app/components/RoleSwitcher';

/**
 * Layout compartido para todas las rutas de /dashboard
 * Incluye Header + Sidebar que aparecen en todas las vistas
 */
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Inicializar sidebar según tamaño de pantalla
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar tamaño de pantalla al montar
  useEffect(() => {
    const handleResize = () => {
      // En pantallas grandes (md: 768px), abrir sidebar por defecto
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Ejecutar al montar
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  // Función para cambiar de rol
  const handleCambiarRol = async (nuevoRolId) => {
    try {
      const response = await fetch('/api/auth/cambiar-rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoRolId })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        alert(data.error || 'Error al cambiar de rol');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar de rol');
    }
  };

  // Mostrar loader mientras carga el usuario
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Responsive */}
      <header className="bg-[#39A900] shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Botón Hamburguesa */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0 text-white"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <img
                  src="https://res.cloudinary.com/dil3rjo71/image/upload/v1763990215/logo-de-Sena-sin-fondo-Blanco-300x300_tlss3c.webp"
                  alt="SENA Logo"
                  className="h-10 w-10 object-contain"
                />
                <div className="h-8 w-px bg-white/30 hidden sm:block"></div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white truncate" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                    Gestión de Bienes
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-3 text-right">
                <div className="hidden md:block">
                  <p className="text-white font-bold text-sm leading-tight">
                    {user.nombres} {user.apellidos}
                  </p>
                  <p className="text-white/80 text-xs font-medium capitalize">
                    {user.rol}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              </div>

              {/* Componente elegante de cambio de rol */}
              <RoleSwitcher user={user} onRoleChange={handleCambiarRol} />
            </div>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          userRole={user.rol}
          userName={user.nombre}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content - aquí se renderiza el children (las páginas) */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
