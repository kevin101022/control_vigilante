// Script para crear datos de prueba (SEDE y AMBIENTE)
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sena_bienes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
});

async function createTestData() {
    console.log('🚀 Creando datos de prueba...\n');

    try {
        // Verificar si ya existen sedes
        const sedesExistentes = await pool.query('SELECT COUNT(*) as total FROM SEDE');

        if (parseInt(sedesExistentes.rows[0].total) <= 1) { // Asumimos que create-test-users crea 1
            console.log('📍 Creando sedes adicionales...');

            // Insertar sedes (IDs manuales 2-5)
            const sedes = [
                { id: 2, nombre: 'Sede Norte' },
                { id: 3, nombre: 'Sede Sur' },
                { id: 4, nombre: 'Sede Centro' }
            ];

            for (const sede of sedes) {
                await pool.query(
                    'INSERT INTO SEDE (sede_id, sede_nombre) VALUES ($1, $2) ON CONFLICT (sede_id) DO NOTHING',
                    [sede.id, sede.nombre]
                );
                console.log(`✅ Sede creada: ${sede.nombre} (ID: ${sede.id})`);
            }
        } else {
            console.log('📍 Sedes ya existen, saltando...');
        }

        // Verificar si ya existen ambientes
        const ambientesExistentes = await pool.query('SELECT COUNT(*) as total FROM AMBIENTE');

        if (parseInt(ambientesExistentes.rows[0].total) === 0) {
            console.log('\n🏢 Creando ambientes...');

            // Obtener la primera sede (Pescadero - ID 1)
            const sedeId = 1;

            // Insertar ambientes (IDs manuales 1-8)
            const ambientes = [
                { id: 1, nombre: 'Ambiente 101 - Sistemas' },
                { id: 2, nombre: 'Ambiente 102 - Redes' },
                { id: 3, nombre: 'Ambiente 201 - Programación' },
                { id: 4, nombre: 'Ambiente 202 - Base de Datos' },
                { id: 5, nombre: 'Ambiente 301 - Multimedia' },
                { id: 6, nombre: 'Laboratorio de Hardware' },
                { id: 7, nombre: 'Sala de Conferencias' },
                { id: 8, nombre: 'Biblioteca' }
            ];

            for (const ambiente of ambientes) {
                await pool.query(
                    'INSERT INTO AMBIENTE (amb_id, amb_nombre, SEDE_sede_id) VALUES ($1, $2, $3) ON CONFLICT (amb_id) DO NOTHING',
                    [ambiente.id, ambiente.nombre, sedeId]
                );
                console.log(`✅ Ambiente creado: ${ambiente.nombre} (ID: ${ambiente.id})`);
            }
        } else {
            console.log('🏢 Ambientes ya existen, saltando...');
        }

        console.log('\n🎉 ¡Datos de prueba creados exitosamente!');

    } catch (error) {
        console.error('❌ Error al crear datos de prueba:', error);
        console.error('Detalles:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar el script
createTestData();
