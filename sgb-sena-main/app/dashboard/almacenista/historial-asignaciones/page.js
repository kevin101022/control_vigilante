'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistorialAsignaciones() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.rol !== 'almacenista') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchAsignaciones();
    }
  }, [user]);

  const fetchAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/asignaciones');
      const data = await response.json();

      if (data.success) {
        setAsignaciones(data.asignaciones);
      } else {
        setError('Error al cargar asignaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDesasignar = async (asignacionId, bienPlaca) => {
    if (!confirm(`¿Estás seguro de desasignar el bien ${bienPlaca}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/asignaciones/${asignacionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Bien desasignado exitosamente');
        fetchAsignaciones(); // Recargar lista
      } else {
        alert(data.error || 'Error al desasignar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const asignacionesFiltradas = asignaciones.filter(a =>
    a.bien_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.bien_descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cuentadante_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.ambiente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Asignaciones</h2>
        <p className="text-gray-600">Gestiona las asignaciones de bienes a cuentadantes</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por placa, descripción, cuentadante o ambiente..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuentadante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ambiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Asignación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39A900]"></div>
                    </div>
                  </td>
                </tr>
              ) : asignacionesFiltradas.length > 0 ? (
                asignacionesFiltradas.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{asignacion.bien_placa}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{asignacion.bien_descripcion}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{asignacion.cuentadante_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{asignacion.ambiente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(asignacion.fecha_asignacion)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDesasignar(asignacion.id, asignacion.bien_placa)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desasignar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay asignaciones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
