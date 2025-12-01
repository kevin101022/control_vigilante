import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/auth/me
 * 
 * Endpoint para obtener el usuario actual autenticado
 * 
 * Útil para:
 * - Verificar si el usuario sigue autenticado
 * - Obtener datos actualizados del usuario desde la BD
 * - Verificar el rol del usuario
 * 
 * Headers requeridos:
 * Authorization: Bearer <token>
 * 
 * O cookie:
 * token=<token>
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "user": { id, nombre, email, rol, ... }
 * }
 * 
 * Respuesta de error (401):
 * {
 *   "error": "No autenticado"
 * }
 */
export async function GET(request) {
    try {
        // Obtener token de la cookie o del header Authorization
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Verificar y decodificar el token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        // Buscar usuario actualizado en la base de datos
        // No incluimos el password en el SELECT por seguridad
        const result = await query(
            `SELECT id, nombre, email, rol, centro_formacion_id, edificio_id, activo, created_at 
       FROM usuarios 
       WHERE id = $1 AND activo = true`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado o inactivo' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error en /api/auth/me:', error);
        return NextResponse.json(
            { error: 'Error al obtener usuario' },
            { status: 500 }
        );
    }
}
