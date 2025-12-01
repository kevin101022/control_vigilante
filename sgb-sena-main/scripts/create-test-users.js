// Script para crear usuarios de prueba en PostgreSQL con contraseñas hasheadas
// Compatible con la nueva estructura de base de datos (PERSONA, ROL, ROL_PERSONA)
// 
// CÓMO EJECUTAR:
// 1. Asegúrate de tener las dependencias instaladas (npm install)
// 2. Crea el archivo .env.local con las credenciales de PostgreSQL
// 3. Ejecuta: npm run create-users

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuración de la base de datos
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sena_bienes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
});

const SALT_ROUNDS = 10;

// Roles a crear (con IDs manuales según esquema)
const roles = [
    { id: 1, nombre: 'coordinador' },
    { id: 2, nombre: 'administrador' },
    { id: 3, nombre: 'cuentadante' },
    { id: 4, nombre: 'almacenista' },
    { id: 5, nombre: 'vigilante' },
    { id: 6, nombre: 'usuario' }
];

// Usuarios de prueba
const usuarios = [
    {
        documento: '1000000001',
        nombres: 'Admin',
        apellidos: 'Principal',
        correo: 'admin@sena.edu.co',
        direccion: 'Calle 1 #1-1',
        telefono: '3001234567',
        tipo_doc: 'CC',
        password: 'admin123',
        rolNombre: 'administrador'
    },
    {
        documento: '1000000002',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'cuentadante@sena.edu.co',
        direccion: 'Calle 2 #2-2',
        telefono: '3001234568',
        tipo_doc: 'CC',
        password: 'cuenta123',
        rolNombre: 'cuentadante'
    },
    {
        documento: '1000000003',
        nombres: 'María',
        apellidos: 'García',
        correo: 'almacenista@sena.edu.co',
        direccion: 'Calle 3 #3-3',
        telefono: '3001234569',
        tipo_doc: 'CC',
        password: 'alma123',
        rolNombre: 'almacenista'
    },
    {
        documento: '1000000004',
        nombres: 'Carlos',
        apellidos: 'López',
        correo: 'vigilante@sena.edu.co',
        direccion: 'Calle 4 #4-4',
        telefono: '3001234570',
        tipo_doc: 'CC',
        password: 'vigi123',
        rolNombre: 'vigilante'
    },
    {
        documento: '1000000005',
        nombres: 'Ana',
        apellidos: 'Martínez',
        correo: 'usuario@sena.edu.co',
        direccion: 'Calle 5 #5-5',
        telefono: '3001234571',
        tipo_doc: 'CC',
        password: 'user123',
        rolNombre: 'usuario'
    },
    {
        documento: '1000000006',
        nombres: 'Luis',
        apellidos: 'Rodríguez',
        correo: 'coordinador@sena.edu.co',
        direccion: 'Calle 6 #6-6',
        telefono: '3001234572',
        tipo_doc: 'CC',
        password: 'coord123',
        rolNombre: 'coordinador'
    }
];

async function createUsers() {
    console.log('🚀 Iniciando creación de usuarios de prueba...\n');

    try {
        // 1. Crear Sede por defecto (ID manual 1)
        console.log('📍 Verificando/Creando sede...');
        await pool.query(
            "INSERT INTO SEDE (sede_id, sede_nombre) VALUES ($1, $2) ON CONFLICT (sede_id) DO NOTHING",
            [1, 'Pescadero']
        );
        const sedeId = 1;
        console.log(`✅ Sede ID: ${sedeId}\n`);

        // 2. Crear Roles
        console.log('🎭 Verificando/Creando roles...');
        for (const rol of roles) {
            await pool.query(
                "INSERT INTO ROL (rol_id, rol_nombre) VALUES ($1, $2) ON CONFLICT (rol_id) DO NOTHING",
                [rol.id, rol.nombre]
            );
        }
        console.log('✅ Roles creados/verificados\n');

        // 3. Crear Personas y asignar roles
        for (const user of usuarios) {
            console.log(`Procesando: ${user.correo}...`);

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

            // Buscar ID del rol
            const rolObj = roles.find(r => r.nombre === user.rolNombre);
            if (!rolObj) {
                console.log(`❌ Error: Rol "${user.rolNombre}" no definido en script`);
                continue;
            }

            // Insertar PERSONA
            const insertPersonaResult = await pool.query(
                `INSERT INTO PERSONA (pers_documento, pers_nombres, pers_apellidos, pers_correo, pers_direccion, pers_telefono, pers_tipodoc, pers_password) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 ON CONFLICT (pers_documento) DO NOTHING
                 RETURNING pers_documento`,
                [user.documento, user.nombres, user.apellidos, user.correo, user.direccion, user.telefono, user.tipo_doc, hashedPassword]
            );

            if (insertPersonaResult.rows.length > 0) {
                console.log(`✅ Persona creada: ${user.correo} (Doc: ${user.documento})`);

                // Insertar en ROL_PERSONA
                await pool.query(
                    `INSERT INTO ROL_PERSONA (ROL_rol_id, PERSONA_pers_documento, SEDE_sede_id) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (ROL_rol_id, PERSONA_pers_documento) DO NOTHING`,
                    [rolObj.id, user.documento, sedeId]
                );

                console.log(`   ✓ Rol asignado: ${user.rolNombre}\n`);
            } else {
                console.log(`⚠️  Persona ya existe: ${user.correo}\n`);
                // Asegurar que tenga el rol aunque la persona ya exista
                await pool.query(
                    `INSERT INTO ROL_PERSONA (ROL_rol_id, PERSONA_pers_documento, SEDE_sede_id) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (ROL_rol_id, PERSONA_pers_documento) DO NOTHING`,
                    [rolObj.id, user.documento, sedeId]
                );
            }
        }

        console.log('🎉 ¡Proceso completado!');
        console.log('\n📋 Usuarios disponibles:');
        usuarios.forEach(u => {
            console.log(`   ${u.correo} - ${u.password} (${u.rolNombre})`);
        });

    } catch (error) {
        console.error('❌ Error al crear usuarios:', error);
        console.error('Detalles:', error.message);
    } finally {
        // Cerrar el pool
        await pool.end();
    }
}

// Ejecutar el script
createUsers();
