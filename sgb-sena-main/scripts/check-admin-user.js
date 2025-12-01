import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sena_bienes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'CR7',
});

async function checkAdmin() {
    try {
        const res = await pool.query(`
            SELECT p.pers_documento, p.pers_nombres, p.pers_apellidos, r.rol_nombre
            FROM PERSONA p
            JOIN ROL_PERSONA rp ON p.pers_documento = rp.PERSONA_pers_documento
            JOIN ROL r ON rp.ROL_rol_id = r.rol_id
            WHERE r.rol_nombre = 'administrador'
        `);

        if (res.rows.length > 0) {
            console.log('✅ Usuarios con rol Administrador encontrados:');
            res.rows.forEach(row => {
                console.log(`- Documento: ${row.pers_documento}, Nombre: ${row.pers_nombres} ${row.pers_apellidos}`);
            });
        } else {
            console.log('❌ No se encontraron usuarios con rol Administrador.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkAdmin();
