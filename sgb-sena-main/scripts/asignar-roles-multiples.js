/**
 * Script para asignar múltiples roles a usuarios
 * 
 * Lógica de negocio:
 * - Administrador: puede tener [administrador, cuentadante, usuario]
 * - Coordinador: puede tener [coordinador, cuentadante, usuario]
 * - Cuentadante: puede tener [cuentadante, usuario]
 * - Almacenista: solo [almacenista]
 * - Vigilante: solo [vigilante]
 * - Usuario: solo [usuario]
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sena_bienes',
  user: 'postgres',
  password: '123456',
});

async function asignarRolesMultiples() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando asignación de roles múltiples...\n');

    // 1. Obtener todos los roles
    const rolesResult = await client.query('SELECT id, nombre FROM rol ORDER BY id');
    const roles = {};
    rolesResult.rows.forEach(r => {
      roles[r.nombre] = r.id;
    });

    console.log('📋 Roles disponibles:', roles);
    console.log('');

    // 2. Obtener todas las personas con sus roles actuales
    const personasResult = await client.query(`
      SELECT DISTINCT p.documento, p.nombres, p.apellidos, r.nombre as rol_actual, rp.sede_id
      FROM persona p
      INNER JOIN rol_persona rp ON p.documento = rp.doc_persona
      INNER JOIN rol r ON rp.rol_id = r.id
      ORDER BY p.documento
    `);

    console.log(`👥 Encontradas ${personasResult.rows.length} asignaciones de roles\n`);

    // 3. Procesar cada persona
    const personasProcesadas = new Set();

    for (const row of personasResult.rows) {
      // Evitar procesar la misma persona múltiples veces
      if (personasProcesadas.has(row.documento)) {
        continue;
      }
      personasProcesadas.add(row.documento);

      const { documento, nombres, apellidos, rol_actual, sede_id } = row;
      const nombreCompleto = `${nombres} ${apellidos}`;

      console.log(`\n👤 Procesando: ${nombreCompleto} (${documento})`);
      console.log(`   Rol actual: ${rol_actual}`);

      // Determinar roles adicionales según el rol actual
      let rolesAdicionales = [];

      switch (rol_actual) {
        case 'administrador':
          rolesAdicionales = ['cuentadante', 'usuario'];
          break;
        case 'coordinador':
          rolesAdicionales = ['cuentadante', 'usuario'];
          break;
        case 'cuentadante':
          rolesAdicionales = ['usuario'];
          break;
        // almacenista, vigilante, usuario no tienen roles adicionales
        default:
          console.log(`   ℹ️  No requiere roles adicionales`);
          continue;
      }

      // Insertar roles adicionales
      for (const rolNombre of rolesAdicionales) {
        const rolId = roles[rolNombre];
        
        // Verificar si ya tiene el rol
        const existeResult = await client.query(
          'SELECT 1 FROM rol_persona WHERE doc_persona = $1 AND rol_id = $2',
          [documento, rolId]
        );

        if (existeResult.rows.length > 0) {
          console.log(`   ⏭️  Ya tiene rol: ${rolNombre}`);
        } else {
          await client.query(
            'INSERT INTO rol_persona (rol_id, doc_persona, sede_id) VALUES ($1, $2, $3)',
            [rolId, documento, sede_id]
          );
          console.log(`   ✅ Asignado rol: ${rolNombre}`);
        }
      }
    }

    console.log('\n\n✅ Proceso completado exitosamente!');
    console.log('\n📊 Resumen de roles por persona:');
    
    // Mostrar resumen
    const resumenResult = await client.query(`
      SELECT 
        p.documento,
        p.nombres || ' ' || p.apellidos as nombre,
        STRING_AGG(r.nombre, ', ' ORDER BY r.id) as roles
      FROM persona p
      INNER JOIN rol_persona rp ON p.documento = rp.doc_persona
      INNER JOIN rol r ON rp.rol_id = r.id
      GROUP BY p.documento, p.nombres, p.apellidos
      ORDER BY p.documento
    `);

    resumenResult.rows.forEach(row => {
      console.log(`\n${row.nombre} (${row.documento}):`);
      console.log(`  Roles: ${row.roles}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
asignarRolesMultiples();
