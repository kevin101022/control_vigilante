import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const responsableId = searchParams.get('responsable_id');

    let sqlQuery = `
      SELECT 
        MIN(b.id) as id_referencia,
        b.nombre,
        b.categoria,
        m.nombre as marca,
        b.modelo,
        u.nombre as responsable_nombre,
        b.cuentadante_id as responsable_id,
        COUNT(*) as cantidad_disponible,
        MIN(b.descripcion) as descripcion_ejemplo
      FROM bienes b
      LEFT JOIN marcas m ON b.marca_id = m.id
      LEFT JOIN usuarios u ON b.cuentadante_id = u.id
      WHERE LOWER(b.estado::text) = 'disponible' AND b.cuentadante_id IS NOT NULL
    `;

    // Filtrar por responsable si se proporciona
    if (responsableId) {
      sqlQuery += ` AND b.cuentadante_id = ${parseInt(responsableId)}`;
    }

    sqlQuery += `
      GROUP BY b.nombre, b.categoria, m.nombre, b.modelo, u.nombre, b.cuentadante_id
      ORDER BY b.nombre ASC
    `;

    const result = await query(sqlQuery);

    return NextResponse.json({
      success: true,
      catalogo: result.rows
    });

  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar el catálogo' },
      { status: 500 }
    );
  }
}
