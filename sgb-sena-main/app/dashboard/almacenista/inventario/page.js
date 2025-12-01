'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventarioBienes() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bienes, setBienes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBien, setSelectedBien] = useState(null);
  const itemsPerPage = 10;

  // Validar autenticación
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(userData);
      // Validar rol si es necesario
      setUser(parsedUser);
    }
  }, [router]);

  // Obtener bienes de la API
  useEffect(() => {
    const fetchBienes = async () => {
      setLoading(true);
      setError('');
      
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);

        const response = await fetch(`/api/bienes?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setBienes(data.bienes);
        } else {
          setError(data.error || 'Error al cargar los bienes');
        }
      } catch (err) {
        console.error('Error al obtener bienes:', err);
        setError('Error de conexión al obtener los bienes');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBienes();
    }
  }, [user, searchTerm]);

  // Volver al dashboard
  const handleBack = () => {
    router.push('/dashboard');
  };

  // Paginación
  const totalPages = Math.ceil(bienes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBienes = bienes.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Color del badge según estado
  const getStatusColor = (estado) => {
    const estadoLower = estado?.toLowerCase();
    switch(estadoLower) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'en_mantenimiento':
      case 'en mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_reparacion':
      case 'en reparación':
        return 'bg-orange-100 text-orange-800';
      case 'dado_de_baja':
      case 'dado de baja':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
        {/* Título y contador */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Inventario Completo</h2>
            {!loading && !error && (
              <p className="text-gray-600">
                Mostrando {currentBienes.length} de {bienes.length} bienes
              </p>
            )}
          </div>
          <button 
            onClick={() => router.push('/dashboard/almacenista/registrar')}
            className="bg-[#39A900] text-white px-4 py-2 rounded-lg hover:bg-[#2e8b00] transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Bien
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Placa, descripción, marca, modelo o serial..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Skeleton loader
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan="9" className="px-6 py-4">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentBienes.length > 0 ? (
                  currentBienes.map((bien) => (
                    <tr key={bien.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bien.placa}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={bien.descripcion}>
                        {bien.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bien.marca || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bien.modelo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bien.serial || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bien.estado)}`}>
                          {bien.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(Number(bien.costo))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bien.responsable || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedBien(bien);
                            setShowModal(true);
                          }}
                          className="text-[#007832] hover:text-[#39A900]"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron bienes con los filtros seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {bienes.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(endIndex, bienes.length)}</span> de{' '}
                    <span className="font-medium">{bienes.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalles del Bien */}
        {showModal && selectedBien && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-[#39A900] to-[#007832] text-white px-6 py-4 flex justify-between items-center sticky top-0">
                <h3 className="text-xl font-bold">Detalles del Bien</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBien(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-6">
                {/* Información Principal */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#39A900]">
                    Información Principal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Placa</p>
                      <p className="font-semibold text-gray-900">{selectedBien.placa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedBien.estado)}`}>
                        {selectedBien.estado}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Descripción</p>
                      <p className="font-semibold text-gray-900">{selectedBien.descripcion}</p>
                    </div>
                  </div>
                </div>

                {/* Especificaciones Técnicas */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#39A900]">
                    Especificaciones Técnicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Marca</p>
                      <p className="font-semibold text-gray-900">{selectedBien.marca || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Modelo</p>
                      <p className="font-semibold text-gray-900">{selectedBien.modelo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Serial</p>
                      <p className="font-semibold text-gray-900">{selectedBien.serial || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vida Útil</p>
                      <p className="font-semibold text-gray-900">{selectedBien.vida_util ? `${selectedBien.vida_util} años` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#39A900]">
                    Información Financiera
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Costo</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {formatCurrency(Number(selectedBien.costo))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Compra</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedBien.fecha_compra)}</p>
                    </div>
                  </div>
                </div>

                {/* Asignación Actual */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-[#39A900]">
                    Asignación Actual
                  </h4>
                  {selectedBien.responsable ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Responsable</p>
                        <p className="font-semibold text-gray-900">{selectedBien.responsable}</p>
                      </div>
                      {selectedBien.ambiente && (
                        <div>
                          <p className="text-sm text-gray-600">Ambiente</p>
                          <p className="font-semibold text-gray-900">{selectedBien.ambiente}</p>
                        </div>
                      )}
                      {selectedBien.sede && (
                        <div>
                          <p className="text-sm text-gray-600">Sede</p>
                          <p className="font-semibold text-gray-900">{selectedBien.sede}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Este bien no está asignado a ningún cuentadante</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end sticky bottom-0">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBien(null);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#39A900] to-[#007832] text-white rounded-lg hover:opacity-90 transition"
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
