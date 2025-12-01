# Arquitectura del Sistema - SENA Gestión de Bienes

## 🏗️ Estructura del Proyecto

```
app/
├── page.js                    # Página de login (/)
├── dashboard/
│   └── page.js               # Dashboard principal (/dashboard)
├── api/
│   └── auth/
│       └── login/
│           └── route.js      # API endpoint para login
├── layout.js                 # Layout principal
└── globals.css              # Estilos globales
```

## 🔧 Cómo Funciona el Backend en Next.js

### ⚠️ Aclaración Importante: Next.js ES Node.js

**Next.js está construido sobre Node.js**, así que cuando escribes código en `app/api/`, estás escribiendo Node.js puro. Puedes usar:
- ✅ Cualquier librería de npm (mysql2, bcrypt, jsonwebtoken, etc.)
- ✅ Módulos nativos de Node.js (fs, path, crypto, etc.)
- ✅ Conexiones a bases de datos
- ✅ Todo lo que harías en Express.js

La diferencia es que Next.js ya te da la estructura de rutas lista, sin necesidad de configurar Express manualmente.

### 1. API Routes (Recomendado para tu proyecto)

Next.js permite crear APIs dentro de la carpeta `app/api/`. Cada carpeta con un archivo `route.js` se convierte en un endpoint.

**Ejemplo:**
- `app/api/auth/login/route.js` → `/api/auth/login`
- `app/api/bienes/route.js` → `/api/bienes`
- `app/api/bienes/[id]/route.js` → `/api/bienes/123`

**Métodos HTTP:**
```javascript
// GET
export async function GET(request) { }

// POST
export async function POST(request) { }

// PUT
export async function PUT(request) { }

// DELETE
export async function DELETE(request) { }
```

### 2. Server Actions (Alternativa moderna)

Funciones que se ejecutan en el servidor pero se llaman desde el cliente:

```javascript
'use server'

export async function crearBien(formData) {
  // Código del servidor
  const bien = await db.bienes.create({...})
  return bien
}
```

## 📊 Próximos Pasos de Implementación

### Fase 1: Base de Datos MySQL

**Opción 1: Prisma (Recomendado - Más fácil)**
```bash
npm install prisma @prisma/client
npx prisma init

# En .env
DATABASE_URL="mysql://usuario:password@localhost:3306/sena_bienes"

# Crear schema en prisma/schema.prisma
# Luego ejecutar:
npx prisma migrate dev --name init
```

**Opción 2: MySQL2 (Directo)**
```bash
npm install mysql2

# Crear conexión en lib/db.js
import mysql from 'mysql2/promise';
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'tu_password',
  database: 'sena_bienes'
});
```

### Fase 2: Autenticación Real
```bash
# Opción 1: NextAuth.js (más fácil)
npm install next-auth

# Opción 2: JWT manual
npm install jsonwebtoken bcrypt
```

### Fase 3: Middleware para Protección de Rutas
Crear `middleware.js` en la raíz:
```javascript
export function middleware(request) {
  // Verificar autenticación
  // Verificar roles
}
```

### Fase 4: Endpoints Necesarios

**Bienes:**
- `POST /api/bienes` - Crear bien
- `GET /api/bienes` - Listar bienes
- `GET /api/bienes/[id]` - Ver bien
- `PUT /api/bienes/[id]` - Actualizar bien
- `DELETE /api/bienes/[id]` - Eliminar bien

**Solicitudes:**
- `POST /api/solicitudes` - Crear solicitud
- `GET /api/solicitudes` - Listar solicitudes
- `PUT /api/solicitudes/[id]/aprobar` - Aprobar
- `PUT /api/solicitudes/[id]/rechazar` - Rechazar

**Usuarios:**
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/[id]` - Actualizar usuario

## 🎯 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso total al sistema |
| **Cuentadante** | Ver reportes, auditorías, depreciación |
| **Almacenista** | Registrar, modificar y dar de baja bienes |
| **Vigilante** | Registrar entradas/salidas de bienes |
| **Usuario** | Solicitar préstamos de bienes |
| **Coordinador** | Aprobar/rechazar solicitudes de su área |

## 🔐 Seguridad

1. **Nunca guardar contraseñas en texto plano** - Usar bcrypt
2. **Usar JWT o sesiones** - No localStorage para producción
3. **Validar en el servidor** - Nunca confiar solo en el cliente
4. **Middleware de autenticación** - Proteger todas las rutas
5. **CORS configurado** - Solo permitir orígenes confiables

## 📝 Estado Actual

✅ Login funcional con API  
✅ Dashboard con 6 roles diferentes  
✅ Navegación entre páginas  
⏳ Base de datos (pendiente)  
⏳ Autenticación JWT (pendiente)  
⏳ CRUD de bienes (pendiente)  
⏳ Sistema de solicitudes (pendiente)
