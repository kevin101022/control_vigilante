import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/solicitudes/cuentadante
 * 
 * Obtiene solicitudes que incluyen bienes asignados a un cuentadante específico
 * Solo muestra solicitudes pendientes (que aún no han sido firmadas por el cuentadante)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documento = searchParams.get('documento');

    if (!documento) {
      return NextResponse.json(
        { success: false, error: 'Documento requerido' },
        { status: 400 }
      );
    }

    // Obtener solicitudes que incluyen bienes del cuentadante
    // y que aún no han sido firmadas por él
    const result = await query(`
      SELECT DISTINCT
        s.id,
        s.fecha_ini_prestamo,
        s.fecha_fin_prestamo,
        s.destino,
        s.motivo,
        s.estado,
        p.nombres || ' ' || p.apellidos as solicitante_nombre,
        p.correo as solicitante_email,
        sed.nombre as sede_nombre,
        (
          SELECT COUNT(*) 
          FROM detalle_solicitud ds2 
          WHERE ds2.solicitud_id = s.id
        ) as items_count
      FROM solicitudes s
      JOIN persona p ON s.doc_persona = p.documento
      LEFT JOIN sedes sed ON s.sede_id = sed.id
      JOIN detalle_solicitud ds ON s.id = ds.solicitud_id
      JOIN asignaciones a ON ds.asignacion_id = a.id
      WHERE a.doc_persona = $1
        AND s.estado = 'pendiente'
        AND NOT EXISTS (
          SELECT 1 FROM firma_solicitud fs
          WHERE fs.solicitud_id = s.id
            AND fs.rol_usuario = 'cuentadante'
            AND fs.doc_persona = $1
        )
      ORDER BY s.id DESC
    `, [documento]);

    return NextResponse.json({
      success: true,
      solicitudes: result.rows
    });

  } catch (error) {
    console.error('Error al obtener solicitudes del cuentadante:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar solicitudes' },
      { status: 500 }
    );
  }
}
