import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/admin/usuarios
 * 
 * Obtiene la lista de todos los usuarios con sus roles asignados
 * Solo accesible para administradores
 */
export async function GET(request) {
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

    // 3. Obtener todos los usuarios con sus roles
    const usuariosResult = await query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.activo,
        u.created_at,
        r_principal.id as rol_principal_id,
        r_principal.nombre as rol_principal_nombre
      FROM usuarios u
      LEFT JOIN roles r_principal ON u.rol_principal_id = r_principal.id
      ORDER BY u.nombre ASC
    `);

    const usuarios = usuariosResult.rows;

    // 4. Para cada usuario, obtener TODOS sus roles (principal + secundarios)
    for (let usuario of usuarios) {
      const rolesResult = await query(`
        SELECT r.id, r.nombre, r.descripcion, ur.es_principal
        FROM roles r
        INNER JOIN usuario_roles ur ON r.id = ur.rol_id
        WHERE ur.usuario_id = $1 AND r.activo = true
        ORDER BY ur.es_principal DESC, r.nombre ASC
      `, [usuario.id]);

      usuario.roles = rolesResult.rows;
    }

    // 5. Retornar lista de usuarios
    return NextResponse.json({
      success: true,
      usuarios: usuarios
    });

  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
