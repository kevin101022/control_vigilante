import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/solicitudes/[id]/firmas
 * 
 * Obtiene todas las firmas de una solicitud
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await query(`
      SELECT 
        fs.id,
        fs.rol_usuario,
        fs.doc_persona,
        fs.firma,
        fs.observacion,
        fs.fecha_firmado,
        p.nombres || ' ' || p.apellidos as firmante_nombre
      FROM firma_solicitud fs
      JOIN persona p ON fs.doc_persona = p.documento
      WHERE fs.solicitud_id = $1
      ORDER BY fs.fecha_firmado ASC
    `, [parseInt(id)]);

    return NextResponse.json({
      success: true,
      firmas: result.rows
    });

  } catch (error) {
    console.error('Error al obtener firmas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar firmas' },
      { status: 500 }
    );
  }
}
