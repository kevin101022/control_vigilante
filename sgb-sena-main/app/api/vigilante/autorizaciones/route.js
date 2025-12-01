import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // 1. Obtener todas las solicitudes activas (o recientes)
        // Se asume que una solicitud "activa" es aquella que no ha sido finalizada o rechazada
        // O simplemente traemos las últimas 50 para el dashboard

        const solicitudesQuery = `
      SELECT 
        s.solic_id,
        s.solic_fecha_ini,
        s.solic_fecha_fin,
        s.solic_destino,
        s.solic_motivo,
        s.solic_estado,
        p.pers_nombres,
        p.pers_apellidos,
        p.pers_documento,
        sd.sede_nombre as ambiente_origen -- Usamos la sede como "ambiente" por ahora, o buscamos el ambiente específico
      FROM SOLICITUD s
      JOIN PERSONA p ON s.PERSONA_pers_documento = p.pers_documento
      JOIN SEDE sd ON s.SEDE_sede_id = sd.sede_id
      ORDER BY s.solic_fecha_ini DESC
      LIMIT 50
    `;

        const solicitudesResult = await query(solicitudesQuery);
        const solicitudes = solicitudesResult.rows;

        // 2. Para cada solicitud, obtener los bienes y las firmas
        const autorizaciones = await Promise.all(solicitudes.map(async (sol) => {

            // Obtener Bienes (Elementos)
            const bienesQuery = `
        SELECT 
          e.elem_serial,
          e.elem_descripcion as nombre,
          e.elem_modelo as modelo,
          e.elem_placa as placa,
          m.marc_nombre as marca,
          -- Intentar determinar el estado actual (En Sitio / Afuera)
          -- Esto es complejo sin una tabla de estados en tiempo real, 
          -- pero podemos usar BITACORA_VIGILANCIA para ver el último movimiento
          COALESCE(
            (SELECT db.detbit_estado 
             FROM DETALLE_BITACORA db
             JOIN BITACORA_VIGILANCIA bv ON db.BITACORA_bit_id = bv.bit_id
             WHERE db.ELEMENTO_elem_placa = e.elem_placa 
             AND bv.SOLICITUD_solic_id = $1
             ORDER BY bv.bit_fecha DESC
             LIMIT 1),
            'En Sitio' -- Estado por defecto si no hay movimientos
          ) as estado
        FROM DETALLE_SOLICITUD ds
        JOIN ASIGNACION a ON ds.ASIGNACION_asig_id = a.asig_id
        JOIN ELEMENTO e ON a.ELEMENTO_elem_placa = e.elem_placa
        JOIN MARCA m ON e.MARCA_marc_id = m.marc_id
        WHERE ds.SOLICITUD_solic_id = $1
      `;
            const bienesResult = await query(bienesQuery, [sol.solic_id]);

            // Mapear estado de DB a estado de Frontend
            const bienes = bienesResult.rows.map(b => ({
                ...b,
                estado: b.estado === 'SALIO' ? 'Afuera' :
                    b.estado === 'REINGRESO' ? 'En Sitio' :
                        b.estado === 'NO_SALIO' ? 'En Sitio' : 'En Sitio'
            }));

            // Obtener Firmas
            const firmasQuery = `
        SELECT 
          r.rol_nombre,
          fs.firm_firmado
        FROM FIRMA_SOLICITUD fs
        JOIN ROL_PERSONA rp ON fs.ROL_PERSONA_ROL_rol_id = rp.ROL_rol_id 
                           AND fs.ROL_PERSONA_PERSONA_pers_documento = rp.PERSONA_pers_documento
        JOIN ROL r ON rp.ROL_rol_id = r.rol_id
        WHERE fs.SOLICITUD_solic_id = $1
      `;
            const firmasResult = await query(firmasQuery, [sol.solic_id]);

            const firmas = {
                cuentadante: false,
                admin: false,
                coordinador: false
            };

            firmasResult.rows.forEach(f => {
                if (f.rol_nombre === 'cuentadante') firmas.cuentadante = f.firm_firmado;
                if (f.rol_nombre === 'administrador') firmas.admin = f.firm_firmado;
                if (f.rol_nombre === 'coordinador') firmas.coordinador = f.firm_firmado;
            });

            return {
                id: `AUT-${sol.solic_id}`, // Formato visual
                original_id: sol.solic_id, // ID real para DB
                solicitante: `${sol.pers_nombres} ${sol.pers_apellidos}`,
                documento: sol.pers_documento.toString(),
                ambiente: sol.ambiente_origen,
                estado_firmas: firmas,
                uso_motivo: sol.solic_motivo,
                destino: sol.solic_destino,
                fecha_salida: sol.solic_fecha_ini.toISOString().split('T')[0], // YYYY-MM-DD
                fecha_limite_regreso: sol.solic_fecha_fin ? sol.solic_fecha_fin.toISOString().split('T')[0] : '',
                bienes: bienes
            };
        }));

        return NextResponse.json({ success: true, autorizaciones });
    } catch (error) {
        console.error('Error fetching autorizaciones:', error);
        return NextResponse.json({ success: false, error: 'Error al obtener autorizaciones' }, { status: 500 });
    }
}
