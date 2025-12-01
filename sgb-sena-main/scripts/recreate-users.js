/**
 * Script: recreate-users.js
 * Descripción: Regenera las contraseñas de los usuarios de prueba
 * Uso: npm run fix-passwords
 * 
 * Útil cuando:
 * - Clonas el repositorio en otro equipo
 * - Restauras un backup de la base de datos
 * - Las credenciales dan error "credenciales incorrectas"
 */

import bcryptjs from 'bcryptjs';
import { query } from '../lib/db.js';

// Usuarios de prueba con sus contraseñas
const usuarios = [
  { email: 'admin@sena.edu.co', password: 'admin123', rolNombre: 'administrador' },
  { email: 'cuentadante@sena.edu.co', password: 'cuenta123', rolNombre: 'cuentadante' },
  { email: 'almacenista@sena.edu.co', password: 'alma123', rolNombre: 'almacenista' },
  { email: 'vigilante@sena.edu.co', password: 'vigi123', rolNombre: 'vigilante' },
  { email: 'usuario@sena.edu.co', password: 'user123', rolNombre: 'usuario' },
  { email: 'coordinador@sena.edu.co', password: 'coord123', rolNombre: 'coordinador' }
];

async function regenerarPasswords() {
  try {
    console.log('🔄 Regenerando contraseñas de usuarios de prueba...\n');

    for (const usuario of usuarios) {
      // Generar nuevo hash de la contraseña
      const hashedPassword = await bcryptjs.hash(usuario.password, 10);

      // Actualizar la contraseña en la base de datos
      // Usando JOIN para obtener el nombre del rol desde la tabla roles
      const updateQuery = `
        UPDATE usuarios u
        SET password = $1 
        WHERE email = $2
        RETURNING u.id, u.nombre, u.email, u.rol_principal_id
      `;

      const result = await query(updateQuery, [hashedPassword, usuario.email]);

      if (result.rowCount > 0) {
        const user = result.rows[0];
        
        // Obtener el nombre del rol para mostrarlo
        const rolQuery = await query('SELECT nombre FROM roles WHERE id = $1', [user.rol_principal_id]);
        const rolNombre = rolQuery.rows.length > 0 ? rolQuery.rows[0].nombre : 'Sin rol';
        
        console.log(`✅ ${rolNombre.padEnd(15)} - ${usuario.email.padEnd(30)} - Contraseña: ${usuario.password}`);
      } else {
        console.log(`⚠️  Usuario no encontrado: ${usuario.email}`);
      }
    }

    console.log('\n✨ Contraseñas regeneradas exitosamente!');
    console.log('\nPuedes iniciar sesión con cualquiera de estas credenciales.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al regenerar contraseñas:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

regenerarPasswords();
