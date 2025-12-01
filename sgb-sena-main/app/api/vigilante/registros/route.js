import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';

export async function POST(request) {
    const client = await getClient();

    try {
        const body = await request.json();
        const {
            tipo, // 'SALIDA' o 'REINGRESO'
            autorizacionId, // ID real de la solicitud (int)
            documentoVigilante,
            observaciones,
            bienes // Array de seriales o placas que se procesaron
        } = body;

        await client.query('BEGIN');

        // 1. Insertar en BITACORA_VIGILANCIA
        const insertBitacoraQuery = `
      INSERT INTO BITACORA_VIGILANCIA (bit_tipo, SOLICITUD_solic_id, PERSONA_pers_documento, bit_observaciones)
      VALUES ($1, $2, $3, $4)
      RETURNING bit_id
    `;
        const bitacoraResult = await client.query(insertBitacoraQuery, [
            tipo,
            autorizacionId,
            documentoVigilante,
            observaciones
        ]);
        const bitId = bitacoraResult.rows[0].bit_id;

        // 2. Insertar detalles y actualizar estados
        // Primero necesitamos obtener los IDs de los elementos (placas) basados en los seriales recibidos
        // Asumimos que 'bienes' contiene los seriales o placas. El frontend manda seriales.

        for (const bien of bienes) {
            // Buscar placa por serial
            const elemQuery = 'SELECT elem_placa FROM ELEMENTO WHERE elem_serial = $1';
            const elemResult = await client.query(elemQuery, [bien.serial]);

            if (elemResult.rows.length > 0) {
                const placa = elemResult.rows[0].elem_placa;
                const estado = tipo === 'SALIDA' ? 'SALIO' : 'REINGRESO';

                // Insertar en DETALLE_BITACORA
                await client.query(`
                INSERT INTO DETALLE_BITACORA (BITACORA_bit_id, ELEMENTO_elem_placa, detbit_estado)
                VALUES ($1, $2, $3)
            `, [bitId, placa, estado]);
            }
        }

        // Si es SALIDA, también debemos registrar los que NO salieron (si aplica)
        // Pero el frontend nos manda solo los procesados. 
        // Podríamos inferir los "NO_SALIO" comparando con la solicitud original, pero por ahora registramos lo que pasó.

        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: 'Registro exitoso', bit_id: bitId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error registering vigilante action:', error);
        return NextResponse.json({ success: false, error: 'Error al registrar acción' }, { status: 500 });
    } finally {
        client.release();
    }
}
