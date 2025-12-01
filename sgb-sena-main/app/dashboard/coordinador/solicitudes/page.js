'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SolicitudesCoordinador() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [firmas, setFirmas] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.rol !== 'coordinador') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSolicitudes();
    }
  }, [user]);

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch('/api/solicitudes?rol=coordinador');
      const data = await res.json();
      console.log('Solicitudes coordinador:', data);
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
      const [resDetalles, resFirmas] = await Promise.all([
        fetch(`/api/solicitudes/${solicitud.id}/detalles`),
        fetch(`/api/solicitudes/${solicitud.id}/firmas`)
      ]);
      
      const dataDetalles = await resDetalles.json();
      const dataFirmas = await resFirmas.json();
      
      if (dataDetalles.success) {
        setDetalles(dataDetalles.detalles);
      }
      if (dataFirmas.success) {
        setFirmas(dataFirmas.firmas);
      }
      setSolicitudSeleccionada(solicitud);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFirmar = async (aprobar) => {
    const observacion = aprobar 
      ? prompt('Observación (opcional):') 
      : prompt('Motivo del rechazo:');
    
    if (!aprobar && !observacion) {
      alert('Debes indicar el motivo del rechazo');
      return;
    }

    if (!confirm(`¿Confirmar ${aprobar ? 'aprobación' : 'rechazo'}?`)) return;

    try {
      const res = await fetch(`/api/solicitudes/${solicitudSeleccionada.id}/firmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: 'coordinador',
          documento: user.documento,
          firma: aprobar,
          observacion
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(aprobar ? 'Solicitud aprobada' : 'Solicitud rechazada');
        setSolicitudSeleccionada(null);
        fetchSolicitudes();
      } else {
        alert(data.error || 'Error al procesar');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const puedeFiremar = async (solicitud) => {
    // Verificar si el cuentadante ya firmó
    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}/firmas`);
      const data = await res.json();
      if (data.success) {
        const firmaCuentadante = data.firmas.find(f => f.rol_usuario === 'cuentadante');
        return firmaCuentadante && firmaCuentadante.firma === true;
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return false;
  };

  const [puedeFiremarState, setPuedeFiremarState] = useState(false);

  useEffect(() => {
    if (solicitudSeleccionada) {
      puedeFiremar(solicitudSeleccionada).then(setPuedeFiremarState);
    }
  }, [solicitudSeleccionada]);

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
        <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
        <p className="text-gray-600">Revisa y aprueba solicitudes</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-2">No hay solicitudes en el sistema</p>
          <p className="text-xs text-gray-400">Las solicitudes aparecerán aquí cuando los usuarios las creen</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
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
                  <td className="px-6 py-4 text-sm text-gray-600">{solicitud.solicitante_nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{solicitud.destino}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      solicitud.estado === 'firmada_cuentadante' ? 'bg-blue-100 text-blue-800' :
                      solicitud.estado === 'firmada_coordinador' ? 'bg-indigo-100 text-indigo-800' :
                      solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {solicitud.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{solicitud.firmas_completadas}/3</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => verDetalles(solicitud)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#39A900] to-[#007832] text-white">
              <h2 className="text-xl font-bold">Solicitud #{solicitudSeleccionada.id}</h2>
              <p className="text-sm opacity-90">{solicitudSeleccionada.solicitante_nombre}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium">{solicitudSeleccionada.destino}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium capitalize">{solicitudSeleccionada.estado.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Estado de firmas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Estado de Firmas</p>
                <div className="space-y-2">
                  {['cuentadante', 'coordinador', 'administrador'].map((rol) => {
                    const firma = firmas.find(f => f.rol_usuario === rol);
                    return (
                      <div key={rol} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-sm capitalize">{rol}</span>
                        {firma ? (
                          firma.firma ? (
                            <span className="text-green-600 text-sm">✓ Firmado</span>
                          ) : (
                            <span className="text-red-600 text-sm">✗ Rechazado</span>
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">⏳ Pendiente</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Bienes Solicitados</p>
                <ul className="space-y-2">
                  {detalles.map((detalle, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{detalle.placa}</p>
                        <p className="text-xs text-gray-500">{detalle.descripcion}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSolicitudSeleccionada(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleFirmar(false)}
                disabled={!puedeFiremarState}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={!puedeFiremarState ? 'El cuentadante debe firmar primero' : ''}
              >
                Rechazar
              </button>
              <button
                onClick={() => handleFirmar(true)}
                disabled={!puedeFiremarState}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={!puedeFiremarState ? 'El cuentadante debe firmar primero' : ''}
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
