import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sena_bienes',
    user: 'postgres',
    password: 'CR7',
});

async function applySchema() {
    console.log('📜 Aplicando esquema de base de datos...');
    try {
        const schemaPath = path.join(__dirname, '../database_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('✅ Esquema aplicado exitosamente!');
    } catch (error) {
        console.error('❌ Error al aplicar esquema:', error.message);
    } finally {
        await pool.end();
    }
}

applySchema();
