# 🚀 Guía de Implementación del Backend - SENA SGB

## ✅ ¿Qué se ha implementado?

Se ha creado un backend completo con autenticación usando:

- **PostgreSQL** - Base de datos
- **bcrypt** - Hasheo seguro de contraseñas
- **JWT** - Tokens para autenticación sin sesiones
- **Next.js API Routes** - Endpoints del servidor

## 📁 Archivos Creados

### Utilidades del Servidor

- `lib/db.js` - Conexión a PostgreSQL con pool
- `lib/auth.js` - Funciones para bcrypt y JWT

### API Endpoints

- `app/api/auth/login/route.js` - Login con BD real
- `app/api/auth/logout/route.js` - Cerrar sesión
- `app/api/auth/me/route.js` - Obtener usuario actual

### Protección de Rutas

- `middleware.js` - Verifica autenticación antes de acceder a rutas

### Scripts

- `scripts/create-test-users.js` - Crea usuarios de prueba en la BD

---

## 🔧 Pasos para Activar el Backend

### **Paso 1: Crear archivo `.env.local`**

En la raíz del proyecto, crea un archivo llamado **`.env.local`** (sin extensión .txt)

Copia este contenido (ya está con tus credenciales):

```bash
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sena_bienes
DB_USER=postgres
DB_PASSWORD=123456

# JWT Secret
JWT_SECRET=sena_super_secreto_jwt_cambiar_en_produccion_2024_sgb
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=development
```

### **Paso 2: Reiniciar el servidor de desarrollo**

```bash
# Detener el servidor actual (Ctrl + C en la terminal)
# Luego iniciar nuevamente:
npm run dev
```

### **Paso 3: Crear usuarios de prueba**

Ejecuta el script para crear usuarios en PostgreSQL con contraseñas hasheadas:

```bash
npm run create-users
```

Deberías ver:

```
✅ Usuario creado: admin@sena.edu.co (ID: 1)
✅ Usuario creado: cuentadante@sena.edu.co (ID: 2)
...
🎉 ¡Proceso completado!
```

### **Paso 4: Probar el login**

1. Ve a http://localhost:3000
2. Ingresa:
   - **Email:** admin@sena.edu.co
   - **Password:** admin123
3. ¡Deberías poder iniciar sesión!

---

## 🔍 ¿Cómo Funciona?

### **1. bcrypt - Hasheo de contraseñas**

**¿Qué hace?**
Convierte contraseñas en un hash irreversible. Nunca guardamos contraseñas en texto plano.

```javascript
// En el script de usuarios:
const hash = await hashPassword("admin123");
// Resultado: "$2b$10$abc123XYZ..." (hash guardado en la BD)

// En el login:
const match = await comparePassword("admin123", hashDeLaBD);
// Si coincide → true, sino → false
```

**¿Por qué es seguro?**

- Es **irreversible** (no se puede "desencriptar")
- Incluye un **salt** random (mismo password = diferentes hashes)
- Es **lento** a propósito (dificulta fuerza bruta)

### **2. JWT - Tokens de autenticación**

**¿Qué es un JWT?**
Un string codificado que contiene datos del usuario y una firma digital.

```
Estructura: Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBzZW5hLmVkdS5jbyIsInJvbCI6ImFkbWluaXN0cmFkb3IifQ.
abc123XYZ789...
```

**¿Cómo funciona?**

1. Usuario hace login
2. Servidor verifica credenciales
3. Servidor genera JWT con datos del usuario
4. Cliente guarda el JWT (en cookie HttpOnly)
5. En cada petición, cliente envía el JWT
6. Servidor verifica el JWT y permite/deniega acceso

**Ventajas:**

- No necesitas guardar sesiones en el servidor
- Stateless (escalable)
- Seguro si usas cookies HttpOnly

### **3. PostgreSQL Pool**

**¿Qué es un pool?**
Un conjunto de conexiones a la base de datos que se reutilizan.

```
Sin pool: Abrir → Query → Cerrar → Abrir → Query → Cerrar (lento ❌)
Con pool:  [Conn 1] → Query → Reusar
           [Conn 2] → Query → Reusar  (rápido ✅)
```

### **4. Middleware de Next.js**

**¿Qué hace?**
Se ejecuta **antes** de que el usuario acceda a una página/API.

```
Usuario intenta: /dashboard
     ↓
Middleware verifica: ¿Tiene token válido?
     ↓ Si → Permitir acceso
     ↓ No → Redirigir a login
```

---

## 🧪 Pruebas Manuales

### **Test 1: Verificar conexión a PostgreSQL**

Abre una terminal y ejecuta:

```bash
node -e "const {query} = require('./lib/db.js'); query('SELECT NOW()').then(r => console.log('DB OK:', r.rows[0]))"
```

Deberías ver: `DB OK: { now: 2024-11-20T... }`

### **Test 2: Login desde el navegador**

1. Ve a http://localhost:3000
2. Usa: admin@sena.edu.co / admin123
3. Abre DevTools (F12) → Application → Cookies
4. Deberías ver una cookie llamada `token` con un valor largo

### **Test 3: API con curl/Postman**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sena.edu.co\",\"password\":\"admin123\"}"
```

Deberías recibir:

```json
{
  "success": true,
  "user": { "id": 1, "nombre": "Admin Principal", ... },
  "token": "eyJhbGci..."
}
```

---

## 🔐 Usuarios de Prueba

Después de ejecutar `npm run create-users`:

| Email                   | Password  | Rol           |
| ----------------------- | --------- | ------------- |
| admin@sena.edu.co       | admin123  | administrador |
| cuentadante@sena.edu.co | cuenta123 | cuentadante   |
| almacenista@sena.edu.co | alma123   | almacenista   |
| vigilante@sena.edu.co   | vigi123   | vigilante     |
| usuario@sena.edu.co     | user123   | usuario       |
| coordinador@sena.edu.co | coord123  | coordinador   |

---

## 📚 Próximos Pasos

Ahora que tienes autenticación funcional, puedes:

1. **Crear APIs para bienes**

   - POST /api/bienes - Crear bien
   - GET /api/bienes - Listar bienes
   - PUT /api/bienes/[id] - Actualizar bien

2. **Proteger rutas por rol**

   - Solo almacenistas pueden crear bienes
   - Solo vigilantes pueden autorizar salidas

3. **Actualizar el frontend**
   - Mostrar datos del usuario desde /api/auth/me
   - Agregar botón de logout
   - Verificar rol antes de mostrar opciones

---

## ❓ Preguntas Frecuentes

### ¿Dónde se guarda el token?

En una **cookie HttpOnly** (más seguro que localStorage). No es accesible desde JavaScript del cliente.

### ¿Cuánto dura el token?

7 días por defecto. Configurable en `.env.local` (JWT_EXPIRES_IN).

### ¿Qué pasa si el token expira?

El middleware lo detecta y redirige al login automáticamente.

### ¿Cómo accedo a datos del usuario en una API?

El middleware agrega headers con los datos:

```javascript
const userId = request.headers.get("x-user-id");
const userRole = request.headers.get("x-user-role");
```

### ¿Es seguro?

Sí, para desarrollo. En producción debes:

- Cambiar JWT_SECRET por algo más aleatorio
- Usar HTTPS
- Agregar rate limiting
- Validar todos los inputs

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'pg'"

```bash
npm install pg bcryptjs jsonwebtoken
```

**Nota:** Usamos `bcryptjs` en lugar de `bcrypt` porque es 100% JavaScript y no requiere compilación nativa (evita problemas en Windows).

### Error: "connect ECONNREFUSED"

- Verifica que PostgreSQL esté corriendo
- Verifica credenciales en `.env.local`
- Verifica que la BD `sena_bienes` exista

### Error: "JWT malformed"

- El token es inválido
- Cierra sesión y vuelve a iniciar

### El middleware no funciona

- Reinicia el servidor (Ctrl+C → npm run dev)
- Verifica que `.env.local` exista

### Error: "Credenciales incorrectas" aunque la contraseña sea correcta

**Síntoma:** Al intentar iniciar sesión con `admin@sena.edu.co` / `admin123`, aparece error de credenciales incorrectas.

**Causa:** Los hashes de contraseñas en la base de datos no son válidos. Probablemente se crearon con el script SQL inicial que tiene hashes placeholder de solo 29 caracteres en lugar de 60.

**Solución:**

```bash
# Actualizar todas las contraseñas con hashes válidos
npm run fix-passwords

# O verificar antes si es el problema
npm run test-login
```

Esto actualizará todas las contraseñas de los usuarios de prueba con hashes válidos de bcrypt.

### Error: "Cannot read properties of undefined (reading 'modules')" con node-gyp-build

**Síntoma:** Error en el navegador que menciona `node-gyp-build` y problemas con módulos nativos.

**Causa:** El paquete `bcrypt` tiene componentes nativos que necesitan compilación en Windows, lo cual puede fallar.

**Solución:** Ya estamos usando `bcryptjs` que es 100% JavaScript y no requiere compilación. Si ves este error:

1. Verifica que `package.json` tenga `bcryptjs` (no `bcrypt`)
2. Detén el servidor (Ctrl+C)
3. Elimina `node_modules` y reinstala:

```bash
rm -r node_modules
npm install
npm run dev
```

---

## 🆕 Scripts disponibles

```bash
npm run dev           # Iniciar servidor de desarrollo
npm run create-users  # Crear usuarios de prueba (si no existen)
npm run fix-passwords # Actualizar contraseñas con hashes válidos
npm run test-login    # Diagnosticar problemas de login
npm run test-db       # Probar conexión a PostgreSQL
```
