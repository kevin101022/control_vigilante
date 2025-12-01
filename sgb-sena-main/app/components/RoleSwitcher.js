'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Componente elegante para cambiar entre roles
 * Solo se muestra si el usuario tiene múltiples roles
 */
export default function RoleSwitcher({ user, onRoleChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si no hay roles disponibles, no mostrar nada
  if (!user.rolesDisponibles || user.rolesDisponibles.length === 0) {
    return null;
  }

  const handleRoleClick = (rolId) => {
    setIsOpen(false);
    onRoleChange(rolId);
  };

  // Mapeo de roles a colores e iconos
  const roleStyles = {
    administrador: { color: 'bg-purple-500', icon: '👑' },
    coordinador: { color: 'bg-blue-500', icon: '📋' },
    cuentadante: { color: 'bg-green-500', icon: '📦' },
    almacenista: { color: 'bg-orange-500', icon: '🏪' },
    usuario: { color: 'bg-teal-500', icon: '👤' },
    vigilante: { color: 'bg-gray-500', icon: '🛡️' }
  };

  const currentRoleStyle = roleStyles[user.rol] || roleStyles.usuario;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentRoleStyle.icon}</span>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold capitalize">{user.rol}</p>
            <p className="text-[10px] opacity-75">Cambiar rol</p>
          </div>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white px-4 py-2">
            <p className="text-xs font-semibold">Cambiar a:</p>
          </div>
          <div className="py-1">
            {user.rolesDisponibles.map((rol) => {
              const style = roleStyles[rol.nombre] || roleStyles.usuario;
              return (
                <button
                  key={rol.id}
                  onClick={() => handleRoleClick(rol.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {style.icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {rol.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleDescription(rol.nombre)}
                    </p>
                  </div>
                  <svg 
                    className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Descripciones de roles
function getRoleDescription(rolNombre) {
  const descriptions = {
    administrador: 'Gestión completa del sistema',
    coordinador: 'Aprobación de solicitudes',
    cuentadante: 'Gestión de bienes asignados',
    almacenista: 'Control de inventario',
    usuario: 'Solicitar bienes prestados',
    vigilante: 'Verificación de salidas'
  };
  return descriptions[rolNombre] || 'Acceso al sistema';
}
