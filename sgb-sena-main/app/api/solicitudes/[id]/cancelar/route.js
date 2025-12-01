import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/solicitudes/[id]/cancelar
 * 
 * Cancela una solicitud (solo si está en estado pendiente)
 */
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que la solicitud existe y está pendiente
    const checkResult = await query(
      'SELECT estado FROM solicitudes WHERE id = $1',
      [parseInt(id)]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].estado !== 'pendiente') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden cancelar solicitudes pendientes' },
        { status: 400 }
      );
    }

    // Cancelar la solicitud
    await query(
      "UPDATE solicitudes SET estado = 'cancelada' WHERE id = $1",
      [parseInt(id)]
    );

    return NextResponse.json({
      success: true,
      message: 'Solicitud cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cancelar solicitud' },
      { status: 500 }
    );
  }
}
