'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GestionUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [rolPrincipal, setRolPrincipal] = useState(null);

  // Cargar usuarios y roles al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar usuarios
      const resUsuarios = await fetch('/api/admin/usuarios');
      const dataUsuarios = await resUsuarios.json();
      
      // Cargar roles
      const resRoles = await fetch('/api/admin/roles');
      const dataRoles = await resRoles.json();

      if (dataUsuarios.success && dataRoles.success) {
        setUsuarios(dataUsuarios.usuarios);
        setRoles(dataRoles.roles);
      } else {
        alert('Error al cargar datos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    // Pre-seleccionar los roles actuales del usuario
    const idsRoles = usuario.roles.map(r => r.id);
    setRolesSeleccionados(idsRoles);
    setRolPrincipal(usuario.rol_principal_id);
  };

  const toggleRol = (rolId) => {
    if (rolesSeleccionados.includes(rolId)) {
      // Remover rol
      const nuevosRoles = rolesSeleccionados.filter(id => id !== rolId);
      setRolesSeleccionados(nuevosRoles);
      
      // Si era el rol principal, limpiar
      if (rolPrincipal === rolId) {
        setRolPrincipal(nuevosRoles.length > 0 ? nuevosRoles[0] : null);
      }
    } else {
      // Agregar rol
      setRolesSeleccionados([...rolesSeleccionados, rolId]);
      
      // Si es el primer rol, hacerlo principal
      if (rolesSeleccionados.length === 0) {
        setRolPrincipal(rolId);
      }
    }
  };

  const guardarCambios = async () => {
    if (!usuarioSeleccionado) return;
    
    if (rolesSeleccionados.length === 0) {
      alert('Debe asignar al menos un rol');
      return;
    }

    if (!rolPrincipal) {
      alert('Debe seleccionar un rol principal');
      return;
    }

    try {
      const response = await fetch(`/api/admin/usuarios/${usuarioSeleccionado.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rolesIds: rolesSeleccionados,
          rolPrincipalId: rolPrincipal
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Roles actualizados correctamente');
        setUsuarioSeleccionado(null);
        cargarDatos(); // Recargar la lista
      } else {
        alert(data.error || 'Error al actualizar roles');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cambios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <p className="text-gray-600">Asignar roles a usuarios del sistema</p>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lista de Usuarios */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {usuarios.map(usuario => (
                <div
                  key={usuario.id}
                  onClick={() => seleccionarUsuario(usuario)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    usuarioSeleccionado?.id === usuario.id
                      ? 'border-[#39A900] bg-green-50'
                      : 'border-gray-200 hover:border-[#39A900] hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{usuario.nombre}</p>
                  <p className="text-sm text-gray-600">{usuario.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {usuario.roles.map(rol => (
                      <span
                        key={rol.id}
                        className={`text-xs px-2 py-1 rounded ${
                          rol.es_principal
                            ? 'bg-[#39A900] text-white font-semibold'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {rol.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Edición */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Asignar Roles</h2>
            
            {usuarioSeleccionado ? (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Editando:</p>
                  <p className="font-semibold text-gray-800">{usuarioSeleccionado.nombre}</p>
                  <p className="text-sm text-gray-600">{usuarioSeleccionado.email}</p>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold text-gray-700">Selecciona los roles:</p>
                  
                  {roles.map(rol => (
                    <div
                      key={rol.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rolesSeleccionados.includes(rol.id)}
                          onChange={() => toggleRol(rol.id)}
                          className="w-5 h-5 text-[#39A900] rounded focus:ring-[#39A900]"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{rol.nombre}</p>
                          <p className="text-xs text-gray-600">{rol.descripcion}</p>
                        </div>
                      </div>

                      {rolesSeleccionados.includes(rol.id) && (
                        <button
                          onClick={() => setRolPrincipal(rol.id)}
                          className={`text-xs px-3 py-1 rounded ${
                            rolPrincipal === rol.id
                              ? 'bg-[#39A900] text-white font-semibold'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {rolPrincipal === rol.id ? '★ Principal' : 'Hacer Principal'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={guardarCambios}
                    className="flex-1 bg-[#39A900] hover:bg-[#007832] text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setUsuarioSeleccionado(null)}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>← Selecciona un usuario de la lista para asignar roles</p>
              </div>
            )}
          </div>

        </div>

    </div>
  );
}
