import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const responsableId = searchParams.get('responsable_id');

    if (!responsableId) {
      return NextResponse.json(
        { success: false, error: 'ID de responsable requerido' },
        { status: 400 }
      );
    }

    // Obtener solicitudes donde el cuentadante sea responsable de algún ítem
    const sqlQuery = `
      SELECT DISTINCT
        s.id,
        s.motivo,
        s.fecha_inicio_prestamo,
        s.fecha_fin_prestamo,
        s.estado,
        s.created_at,
        u.nombre as solicitante_nombre,
        u.email as solicitante_email,
        e.nombre as sede_destino,
        (SELECT COUNT(*) FROM detalle_solicitud WHERE solicitud_id = s.id AND responsable_id = $1) as items_count
      FROM solicitudes s
      INNER JOIN detalle_solicitud ds ON ds.solicitud_id = s.id
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN edificios e ON s.sede_destino_id = e.id
      WHERE ds.responsable_id = $1
      ORDER BY s.created_at DESC
    `;

    const result = await query(sqlQuery, [responsableId]);

    return NextResponse.json({
      success: true,
      solicitudes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar solicitudes' },
      { status: 500 }
    );
  }
}
