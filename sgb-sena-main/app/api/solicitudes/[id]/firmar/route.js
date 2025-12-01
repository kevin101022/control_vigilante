import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/solicitudes/[id]/firmar
 * 
 * Registra la firma de un rol (cuentadante, coordinador, administrador)
 * y actualiza el estado de la solicitud según corresponda
 */
export async function POST(request, { params }) {
  const client = await query('BEGIN');
  
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || isNaN(parseInt(id))) {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rol, documento, firma, observacion } = body;

    if (!rol || !documento || firma === undefined) {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la solicitud existe
    const solicitudResult = await query(
      'SELECT estado FROM solicitudes WHERE id = $1',
      [parseInt(id)]
    );

    if (solicitudResult.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    const estadoActual = solicitudResult.rows[0].estado;

    // Validar que se puede firmar según el estado
    if (rol === 'cuentadante' && estadoActual !== 'pendiente') {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Esta solicitud ya no está pendiente' },
        { status: 400 }
      );
    }

    if (rol === 'coordinador' && estadoActual !== 'firmada_cuentadante') {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'El cuentadante aún no ha firmado' },
        { status: 400 }
      );
    }

    if (rol === 'administrador' && estadoActual !== 'firmada_coordinador') {
      await query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'El coordinador aún no ha firmado' },
        { status: 400 }
      );
    }

    // Registrar la firma
    await query(`
      INSERT INTO firma_solicitud (solicitud_id, rol_usuario, doc_persona, firma, observacion)
      VALUES ($1, $2, $3, $4, $5)
    `, [parseInt(id), rol, documento, firma, observacion || null]);

    // Actualizar estado de la solicitud
    let nuevoEstado;
    if (!firma) {
      // Si rechaza, la solicitud queda rechazada
      nuevoEstado = 'rechazada';
    } else {
      // Si aprueba, avanza al siguiente estado
      if (rol === 'cuentadante') {
        nuevoEstado = 'firmada_cuentadante';
      } else if (rol === 'coordinador') {
        nuevoEstado = 'firmada_coordinador';
      } else if (rol === 'administrador') {
        nuevoEstado = 'aprobada';
      }
    }

    await query(
      'UPDATE solicitudes SET estado = $1 WHERE id = $2',
      [nuevoEstado, parseInt(id)]
    );

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      message: firma ? 'Firma registrada exitosamente' : 'Solicitud rechazada',
      nuevoEstado
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error al firmar solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la firma' },
      { status: 500 }
    );
  }
}
