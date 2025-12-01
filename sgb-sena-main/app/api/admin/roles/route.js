import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/admin/roles
 * 
 * Obtiene la lista de todos los roles disponibles en el sistema
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

    // 3. Obtener todos los roles activos
    const rolesResult = await query(`
      SELECT id, nombre, descripcion, activo
      FROM roles
      WHERE activo = true
      ORDER BY nombre ASC
    `);

    // 4. Retornar lista de roles
    return NextResponse.json({
      success: true,
      roles: rolesResult.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
