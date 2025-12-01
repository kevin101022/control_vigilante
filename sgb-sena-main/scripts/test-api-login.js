// Script mejorado para probar el endpoint de login
async function testLoginAPI() {
    console.log('🧪 Probando endpoint de login...\n');

    try {
        // Primero verificar si el servidor está respondiendo
        console.log('1️⃣ Verificando servidor en http://localhost:3000...');
        const healthCheck = await fetch('http://localhost:3000');
        console.log('Status:', healthCheck.status);

        const healthText = await healthCheck.text();
        console.log('Respuesta del servidor:', healthText.substring(0, 200));
        console.log('');

        // Ahora probar el endpoint de login
        console.log('2️⃣ Probando endpoint /api/auth/login...');
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: 'admin@sena.edu.co',
                password: 'admin123'
            }),
        });

        console.log('Status Code:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        const responseText = await response.text();
        console.log('\n📦 Respuesta completa:');
        console.log(responseText.substring(0, 500));

        // Intentar parsear como JSON
        try {
            const data = JSON.parse(responseText);
            console.log('\n📊 Datos parseados:');
            console.log(JSON.stringify(data, null, 2));

            if (response.ok) {
                console.log('\n✅ ¡LOGIN EXITOSO!');
            } else {
                console.log('\n❌ ERROR EN LOGIN');
            }
        } catch (parseError) {
            console.log('\n❌ La respuesta NO es JSON válido');
            console.log('Error:', parseError.message);
        }

    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        console.log('\n💡 Verifica:');
        console.log('1. Que el servidor esté corriendo: npm run dev');
        console.log('2. Que esté en el puerto 3000');
        console.log('3. Que no haya errores en la consola del servidor');
    }
}

testLoginAPI();
