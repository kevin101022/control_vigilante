'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MisSolicitudes() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSolicitudes();
    }
  }, [user]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/solicitudes?rol=usuario&documento=${user.documento}`);
      const data = await res.json();
      
      if (data.success) {
        setSolicitudes(data.solicitudes);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalles = async (solicitud) => {
    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}/detalles`);
      const data = await res.json();
      
      if (data.success) {
        setDetalles(data.detalles);
        setSolicitudSeleccionada(solicitud);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar detalles');
    }
  };

  const cancelarSolicitud = async (solicitudId) => {
    if (!confirm('¿Estás seguro de cancelar esta solicitud?')) return;

    try {
      const res = await fetch(`/api/solicitudes/${solicitudId}/cancelar`, {
        method: 'POST'
      });

      const data = await res.json();

      if (data.success) {
        alert('Solicitud cancelada');
        fetchSolicitudes();
      } else {
        alert(data.error || 'Error al cancelar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'firmada_cuentadante': 'bg-blue-100 text-blue-800',
      'firmada_coordinador': 'bg-indigo-100 text-indigo-800',
      'aprobada': 'bg-green-100 text-green-800',
      'rechazada': 'bg-red-100 text-red-800',
      'cancelada': 'bg-gray-100 text-gray-800',
      'autorizada': 'bg-purple-100 text-purple-800',
      'en_prestamo': 'bg-teal-100 text-teal-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'firmada_cuentadante': 'Firmada por Cuentadante',
      'firmada_coordinador': 'Firmada por Coordinador',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'cancelada': 'Cancelada',
      'autorizada': 'Autorizada',
      'en_prestamo': 'En Préstamo'
    };
    return textos[estado] || estado;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis Solicitudes</h1>
        <p className="text-gray-600">Historial de solicitudes de préstamo</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes solicitudes aún</p>
          <button
            onClick={() => router.push('/dashboard/usuario/solicitar')}
            className="px-6 py-2 bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition"
          >
            Crear Solicitud
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firmas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.map(solicitud => (
                <tr key={solicitud.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{solicitud.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{new Date(solicitud.fecha_ini_prestamo).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">
                      hasta {new Date(solicitud.fecha_fin_prestamo).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{solicitud.destino}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(solicitud.estado)}`}>
                      {getEstadoTexto(solicitud.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {solicitud.firmas_completadas}/3
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => verDetalles(solicitud)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                    >
                      Ver Detalles
                    </button>
                    {solicitud.estado === 'pendiente' && (
                      <button
                        onClick={() => cancelarSolicitud(solicitud.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#39A900] to-[#007832] text-white">
              <h2 className="text-xl font-bold">Detalle de Solicitud #{solicitudSeleccionada.id}</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(solicitudSeleccionada.estado)}`}>
                    {getEstadoTexto(solicitudSeleccionada.estado)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sede</p>
                  <p className="font-medium">{solicitudSeleccionada.sede_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium">{solicitudSeleccionada.destino}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fechas</p>
                  <p className="font-medium text-sm">
                    {new Date(solicitudSeleccionada.fecha_ini_prestamo).toLocaleDateString()} - {new Date(solicitudSeleccionada.fecha_fin_prestamo).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Motivo</p>
                <p className="text-sm">{solicitudSeleccionada.motivo}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Bienes Solicitados</p>
                {detalles.length === 0 ? (
                  <p className="text-sm text-gray-500">Cargando...</p>
                ) : (
                  <ul className="space-y-2">
                    {detalles.map((detalle, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{detalle.placa}</p>
                          <p className="text-xs text-gray-500">{detalle.descripcion}</p>
                          <p className="text-xs text-gray-500">Cuentadante: {detalle.cuentadante_nombre}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setSolicitudSeleccionada(null);
                  setDetalles([]);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
