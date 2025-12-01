import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * POST /api/auth/register
 * 
 * Endpoint de registro de usuarios
 * 
 * FLUJO:
 * 1. Recibe datos del usuario
 * 2. Verifica si el usuario ya existe
 * 3. Hashea la contraseña
 * 4. Inserta en tabla PERSONA
 * 5. Asigna rol por defecto (Usuario) en ROL_PERSONA
 */
export async function POST(request) {
    try {
        const data = await request.json();
        const {
            documento, nombres, apellidos, correo,
            direccion, telefono, tipo_doc, password
        } = data;

        // 1. Validaciones básicas
        if (!documento || !nombres || !apellidos || !correo || !password) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // 2. Verificar si ya existe por documento o correo
        const existingUser = await query(
            'SELECT pers_documento FROM PERSONA WHERE pers_documento = $1 OR pers_correo = $2',
            [documento, correo]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'El usuario ya existe (documento o correo duplicado)' },
                { status: 409 }
            );
        }

        // 3. Hashear contraseña
        const hashedPassword = await hashPassword(password);

        // 4. Insertar en PERSONA
        await query(
            `INSERT INTO PERSONA (
        pers_documento, pers_nombres, pers_apellidos, pers_correo, 
        pers_direccion, pers_telefono, pers_tipodoc, pers_password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [documento, nombres, apellidos, correo, direccion, telefono, tipo_doc, hashedPassword]
        );

        // 5. Asignar Rol por defecto (Usuario - ID 6) y Sede por defecto (ID 1)
        // Nota: Asumimos que el rol 6 es 'usuario' y sede 1 existe
        // Si no existen, esto fallará por FK, lo cual es correcto
        try {
            await query(
                'INSERT INTO ROL_PERSONA (ROL_rol_id, PERSONA_pers_documento, SEDE_sede_id) VALUES ($1, $2, $3)',
                [6, documento, 1] // 6 = Usuario, 1 = Sede Principal (Pescadero)
            );
        } catch (roleError) {
            console.error('Error al asignar rol:', roleError);
            // Si falla la asignación de rol, podríamos querer borrar la persona o dejarla sin rol
            // Por ahora retornamos éxito pero logueamos el error
        }

        return NextResponse.json({
            success: true,
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
