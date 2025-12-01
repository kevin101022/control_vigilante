import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/admin/usuarios/[id]/roles
 * 
 * Asigna o remueve roles a un usuario
 * Solo accesible para administradores
 * 
 * Body:
 * {
 *   "rolesIds": [1, 2, 6],  // IDs de los roles a asignar
 *   "rolPrincipalId": 2     // ID del rol que será el principal
 * }
 */
export async function POST(request, context) {
  try {
    // 1. Verificar token de autenticación
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 2. Verificar que el usuario sea administrador
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    if (decoded.rol !== 'administrador') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder' },
        { status: 403 }
      );
    }

    // 3. Obtener parámetros (await params en Next.js 15+)
    const params = await context.params;
    const usuarioId = parseInt(params.id);
    const { rolesIds, rolPrincipalId } = await request.json();

    // Validar que params.id sea válido
    if (isNaN(usuarioId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // 4. Validar que el usuario exista
    const usuarioResult = await query(
      'SELECT id FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 5. Validar que todos los roles existan
    if (!rolesIds || rolesIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe asignar al menos un rol' },
        { status: 400 }
      );
    }

    // 6. Validar que el rol principal esté en la lista de roles
    const rolPrincipalIdNum = parseInt(rolPrincipalId);
    if (isNaN(rolPrincipalIdNum)) {
      return NextResponse.json(
        { error: 'El rol principal debe ser un ID válido' },
        { status: 400 }
      );
    }

    if (!rolesIds.includes(rolPrincipalIdNum)) {
      return NextResponse.json(
        { error: 'El rol principal debe estar en la lista de roles asignados' },
        { status: 400 }
      );
    }

    // 7. Iniciar transacción
    await query('BEGIN');

    try {
      // 8. Eliminar todos los roles actuales del usuario
      await query(
        'DELETE FROM usuario_roles WHERE usuario_id = $1',
        [usuarioId]
      );

      // 9. Insertar los nuevos roles
      for (const rolId of rolesIds) {
        const esPrincipal = rolId === rolPrincipalIdNum;
        
        await query(`
          INSERT INTO usuario_roles (usuario_id, rol_id, es_principal)
          VALUES ($1, $2, $3)
        `, [usuarioId, rolId, esPrincipal]);
      }

      // 10. Actualizar rol_principal_id en la tabla usuarios
      await query(
        'UPDATE usuarios SET rol_principal_id = $1 WHERE id = $2',
        [rolPrincipalIdNum, usuarioId]
      );

      // 11. Commit de la transacción
      await query('COMMIT');

      console.log(`✅ Roles actualizados para usuario ${usuarioId} por admin ${decoded.id}`);

      // 12. Retornar éxito
      return NextResponse.json({
        success: true,
        message: 'Roles actualizados correctamente'
      });

    } catch (error) {
      // Rollback en caso de error
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error al asignar roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
