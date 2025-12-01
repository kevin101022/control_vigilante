import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/ambientes
 * 
 * Obtiene todos los ambientes disponibles
 */
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        a.id,
        a.nombre,
        s.nombre as sede_nombre
      FROM ambientes a
      JOIN sedes s ON a.sede_id = s.id
      ORDER BY s.nombre ASC, a.nombre ASC
    `);

    return NextResponse.json({
      success: true,
      ambientes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener ambientes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener ambientes' },
      { status: 500 }
    );
  }
}
