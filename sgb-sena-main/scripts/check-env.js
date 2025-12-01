// Script para verificar variables de entorno
console.log('🔍 Verificando variables de entorno...\n');

console.log('DB_HOST:', process.env.DB_HOST || '❌ NO DEFINIDO');
console.log('DB_PORT:', process.env.DB_PORT || '❌ NO DEFINIDO');
console.log('DB_NAME:', process.env.DB_NAME || '❌ NO DEFINIDO');
console.log('DB_USER:', process.env.DB_USER || '❌ NO DEFINIDO');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ DEFINIDO (oculto)' : '❌ NO DEFINIDO');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `✅ DEFINIDO (${process.env.JWT_SECRET.substring(0, 20)}...)` : '❌ NO DEFINIDO');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '❌ NO DEFINIDO');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NO DEFINIDO');

console.log('\n📝 Archivo .env.local debe existir en:', process.cwd());
