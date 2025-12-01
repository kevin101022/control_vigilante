// Script de verificación rápida de conexión a PostgreSQL
//
// Ejecutar: node scripts/test-connection.js
//
// Este script verifica que puedas conectarte a PostgreSQL correctamente

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: '123456',
});

async function testConnection() {
    console.log('🔍 Verificando conexión a PostgreSQL...\n');

    try {
        // Test 1: Conexión básica
        const result = await pool.query('SELECT NOW() as now, version() as version');
        console.log('✅ Conexión exitosa!');
        console.log('   Hora del servidor:', result.rows[0].now);
        console.log('   Versión:', result.rows[0].version.split(',')[0]);

        // Test 2: Verificar que exista la tabla PERSONA
        // Nota: PostgreSQL guarda los nombres de tablas sin comillas en minúsculas por defecto
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'persona'
      );
    `);

        if (tableCheck.rows[0].exists) {
            console.log('\n✅ Tabla "PERSONA" encontrada');

            // Test 3: Contar usuarios
            const countResult = await pool.query('SELECT COUNT(*) as total FROM PERSONA');
            console.log(`   Total de personas: ${countResult.rows[0].total}`);

            if (countResult.rows[0].total > 0) {
                // Mostrar algunos usuarios (sin passwords)
                const usersResult = await pool.query('SELECT pers_documento, pers_nombres, pers_correo FROM PERSONA LIMIT 3');
                console.log('\n📋 Personas de ejemplo:');
                usersResult.rows.forEach(u => {
                    console.log(`   - ${u.pers_nombres} (${u.pers_correo}) - Doc: ${u.pers_documento}`);
                });
            } else {
                console.log('\n⚠️  No hay personas creadas');
                console.log('   Ejecuta: npm run create-users');
            }
        } else {
            console.log('\n❌ Tabla "PERSONA" NO encontrada');
            console.log('   Verifica que ejecutaste el schema SQL en pgAdmin');
        }

        console.log('\n🎉 ¡Todo listo para usar el backend!');

    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('   1. Verifica que PostgreSQL esté corriendo');
        console.log('   2. Verifica las credenciales en .env.local');
        console.log('   3. Verifica que la base de datos "sena_bienes" exista');
    } finally {
        await pool.end();
    }
}

testConnection();
