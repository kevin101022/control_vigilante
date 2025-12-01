import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * 
 * Endpoint de autenticación - Permite a los usuarios iniciar sesión
 * 
 * FLUJO:
 * 1. Recibe documento y password del cliente
 * 2. Busca el usuario en la base de datos PostgreSQL
 * 3. Verifica la contraseña usando bcrypt
 * 4. Si es correcta, genera un JWT token
 * 5. Retorna el token y los datos del usuario
 * 
 * Body esperado:
 * {
 *   "documento": "1000000001",
 *   "password": "admin123"
 * }
 */
export async function POST(request) {
  try {
    // 1. Obtener datos del body
    const { documento, password } = await request.json();

    // 2. Validar que existan documento y password
    if (!documento || !password) {
      return NextResponse.json(
        { error: 'Documento y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // 3. Buscar persona en la base de datos por documento
    // NUEVO ESQUEMA: Tabla PERSONA, columna pers_documento
    const result = await query(
      'SELECT * FROM PERSONA WHERE pers_documento = $1',
      [documento]
    );

    // Si no se encontró la persona
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const persona = result.rows[0];

    // 4. Verificar contraseña con bcrypt
    // NUEVO ESQUEMA: Columna pers_password
    const passwordMatch = await comparePassword(password, persona.pers_password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // 5. Obtener roles de la persona
    // NUEVO ESQUEMA: Tablas ROL y ROL_PERSONA
    // Ordenar por prioridad: coordinador > administrador > cuentadante > almacenista > vigilante > usuario
    const rolesQuery = await query(`
      SELECT r.rol_id, r.rol_nombre, rp.SEDE_sede_id
      FROM ROL r
      INNER JOIN ROL_PERSONA rp ON r.rol_id = rp.ROL_rol_id
      WHERE rp.PERSONA_pers_documento = $1
      ORDER BY 
        CASE r.rol_nombre
          WHEN 'coordinador' THEN 1
          WHEN 'administrador' THEN 2
          WHEN 'cuentadante' THEN 3
          WHEN 'almacenista' THEN 4
          WHEN 'vigilante' THEN 5
          WHEN 'usuario' THEN 6
          ELSE 7
        END ASC
    `, [persona.pers_documento]);

    if (rolesQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Error: Usuario sin rol asignado' },
        { status: 500 }
      );
    }

    // Asumimos el primer rol como principal por defecto
    const rolPrincipal = rolesQuery.rows[0];

    // Mapear roles al formato esperado por el frontend (id, nombre)
    const rolesMapeados = rolesQuery.rows.map(r => ({
      id: r.rol_id,
      nombre: r.rol_nombre,
      sedeId: r.SEDE_sede_id
    }));

    const rolPrincipalMapeado = rolesMapeados[0];
    const rolesDisponibles = rolesMapeados.filter(r => r.id !== rolPrincipalMapeado.id);

    // 6. Generar JWT token
    const token = generateToken({
      id: persona.pers_documento, // Usamos documento como ID
      documento: persona.pers_documento,
      correo: persona.pers_correo,
      nombre: `${persona.pers_nombres} ${persona.pers_apellidos}`,
      rol: rolPrincipal.rol_nombre
    });

    // 7. Preparar respuesta (sin enviar la contraseña)
    // Mapeamos los campos de la BD a los campos que espera el frontend
    const userResponse = {
      id: persona.pers_documento,
      documento: persona.pers_documento,
      nombres: persona.pers_nombres,
      apellidos: persona.pers_apellidos,
      nombre: `${persona.pers_nombres} ${persona.pers_apellidos}`, // Alias para compatibilidad
      correo: persona.pers_correo,
      direccion: persona.pers_direccion,
      telefono: persona.pers_telefono,
      tipo_doc: persona.pers_tipodoc,
      rol: rolPrincipal.rol_nombre,
      rolActual: rolPrincipalMapeado,
      rolesDisponibles: rolesDisponibles
    };

    // 8. Crear respuesta
    const response = NextResponse.json({
      success: true,
      user: userResponse,
      token
    });

    // 9. Guardar token en cookie HttpOnly
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ Login exitoso:', persona.pers_documento, '-', rolPrincipal.rol_nombre);

    return response;

  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
