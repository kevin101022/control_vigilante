# Flujo del Sistema de Gestión de Bienes - SENA

## 🔄 Flujo de Solicitud de Préstamo

```
1. USUARIO
   ↓ Solicita préstamo de bien(es) de diferentes cuentadantes
   ↓ Sistema agrupa automáticamente por cuentadante
   ↓ Se crean N solicitudes (una por cada cuentadante)
   
2. CUENTADANTE
   ↓ Ve solicitudes que incluyen sus bienes
   ↓ Firma o Rechaza (solo sus bienes)
   ↓ Estado: pendiente → firmada_cuentadante
   
3. COORDINADOR
   ↓ Ve TODAS las solicitudes
   ↓ Puede firmar solo si cuentadante ya firmó
   ↓ Aprueba o Rechaza
   ↓ Estado: firmada_cuentadante → firmada_coordinador
   
4. ADMINISTRADOR
   ↓ Ve TODAS las solicitudes
   ↓ Puede firmar solo si coordinador ya firmó
   ↓ Aprueba o Rechaza (aprobación final)
   ↓ Estado: firmada_coordinador → aprobada
   
5. VIGILANTE (Pendiente)
   ↓ Verifica que tenga las 3 firmas
   ↓ Autoriza salida del bien
   ↓ Estado: aprobada → autorizada
   ↓ Bienes se marcan como bloqueados
   
6. USUARIO retira el bien
   ↓ Estado: autorizada → en_prestamo
```

## 👥 Roles y Responsabilidades

### 1. Usuario
**Acciones:**
- ✅ Solicitar préstamo de bienes
- ✅ Ver estado de sus solicitudes
- ✅ Ver historial de préstamos

**Reglas:**
- Puede solicitar múltiples bienes en una sola solicitud
- Los bienes deben estar asignados a cuentadantes

---

### 2. Cuentadante
**Acciones:**
- ✅ Ver bienes asignados bajo su responsabilidad
- ✅ Firmar solicitudes de préstamo de sus bienes
- ✅ Ver solicitudes pendientes de firma

**Reglas:**
- Tiene bienes asignados por el almacenista
- Solo puede firmar solicitudes de sus propios bienes
- Los bienes asignados NO pueden estar en préstamo (bloqueados)

---

### 3. Coordinador
**Acciones:**
- ✅ Ver TODAS las solicitudes del sistema
- ✅ Firmar solicitudes (solo si cuentadante ya firmó)
- ✅ Rechazar solicitudes con observación
- ✅ Ver estado de firmas en tiempo real

**Reglas:**
- Ve todas las solicitudes sin importar el estado
- Botones de firmar/rechazar se habilitan solo cuando el cuentadante ya firmó
- Su firma es la segunda de tres necesarias
- Puede ver el progreso de firmas de cada solicitud

---

### 4. Vigilante
**Acciones:**
- ✅ Verificar solicitudes aprobadas
- ✅ Autorizar salida de bienes
- ✅ Ver historial de salidas

**Reglas:**
- Solo autoriza si la solicitud está aprobada por coordinador
- Verifica que todos los cuentadantes hayan firmado

---

### 5. Almacenista
**Acciones:**
- ✅ Registrar nuevos bienes (con placa automática SENA-YYYY-NNNN)
- ✅ Asignar bienes a cuentadantes y ambientes
- ✅ Desasignar bienes (solo si NO están en préstamo)
- ✅ Ver inventario completo
- ✅ Ver historial de asignaciones

**Reglas:**
- Las placas se generan automáticamente
- No puede desasignar bienes que están bloqueados (en préstamo)
- Es el único que puede registrar bienes nuevos

---

### 6. Administrador
**Acciones:**
- ✅ Ver TODAS las solicitudes del sistema
- ✅ Firmar solicitudes (solo si cuentadante Y coordinador ya firmaron)
- ✅ Rechazar solicitudes con observación
- ✅ Aprobación final de solicitudes
- ✅ Gestionar usuarios y roles
- ✅ Acceso completo al sistema

**Reglas:**
- Ve todas las solicitudes sin importar el estado
- Botones de firmar/rechazar se habilitan solo cuando cuentadante Y coordinador ya firmaron
- Su firma es la tercera y última (aprobación final)
- Puede tener múltiples roles (administrador, cuentadante, usuario)

---

## 📊 Estados de una Solicitud

| Estado | Descripción | Siguiente Acción |
|--------|-------------|------------------|
| **pendiente** | Esperando firma del cuentadante | Cuentadante debe firmar |
| **firmada_cuentadante** | Cuentadante firmó, esperando coordinador | Coordinador debe firmar |
| **firmada_coordinador** | Coordinador firmó, esperando administrador | Administrador debe firmar |
| **aprobada** | Administrador aprobó (3/3 firmas) | Vigilante debe autorizar salida |
| **rechazada** | Alguien rechazó la solicitud | Fin del proceso |
| **cancelada** | Usuario canceló la solicitud | Fin del proceso |
| **autorizada** | Vigilante autorizó salida | Usuario puede retirar |
| **en_prestamo** | Bien entregado y en uso | Pendiente devolución |
| **devuelto** | Bien devuelto | Proceso completado |

---

## 🗄️ Estructura de Base de Datos (PostgreSQL)

### Tablas Principales:

**persona**
- documento (PK), nombres, apellidos, correo, contraseña, direccion, telefono, tipo_doc

**rol**
- id (PK), nombre

**rol_persona**
- rol_id (FK), doc_persona (FK), sede_id (FK)
- Una persona puede tener múltiples roles

**bienes**
- id (PK), placa (SENA-YYYY-NNNN), descripcion, modelo, marca_id, serial, fecha_compra, vida_util, costo

**asignaciones**
- id (PK), bien_id (FK), ambiente_id (FK), doc_persona (FK), bloqueado (bool), fecha_asignacion
- bloqueado = true cuando el bien está en préstamo

**solicitudes**
- id (PK), fecha_ini_prestamo, fecha_fin_prestamo, doc_persona (FK), destino, motivo, estado, observaciones, sede_id

**detalle_solicitud**
- id (PK), solicitud_id (FK), asignacion_id (FK)

**firma_solicitud**
- id (PK), solicitud_id (FK), rol_usuario, doc_persona (FK), firma (bool), observacion, fecha_firmado

**sedes**
- id (PK), nombre

**ambientes**
- id (PK), nombre, sede_id (FK)

**marcas**
- id (PK), nombre, activo

**estado_bien**
- id (PK), bien_id (FK), estado, fecha_registro

---

## 🔐 Validaciones Importantes

### Bienes y Asignaciones
1. **No se puede desasignar un bien que está bloqueado (en préstamo)**
2. **Las placas se generan automáticamente con formato SENA-YYYY-NNNN**
3. **Un bien bloqueado no puede ser asignado a otro cuentadante**
4. **Solo bienes no bloqueados aparecen disponibles para solicitar**

### Solicitudes y Firmas
5. **Orden estricto de firmas: Cuentadante → Coordinador → Administrador**
6. **Coordinador NO puede firmar si cuentadante no ha firmado** (botones deshabilitados)
7. **Administrador NO puede firmar si coordinador no ha firmado** (botones deshabilitados)
8. **Cuentadante solo ve solicitudes que incluyen sus bienes**
9. **Coordinador y Administrador ven TODAS las solicitudes**
10. **Usuario solo puede cancelar solicitudes en estado "pendiente"**
11. **Si alguien rechaza, la solicitud queda en estado "rechazada" (fin del proceso)**
12. **Cada firma se registra con: rol, persona, fecha, observación**

---

## 🎭 Sistema de Roles Múltiples

Algunas personas pueden tener múltiples roles:

- **Administrador** → puede actuar como cuentadante y usuario
- **Coordinador** → puede actuar como cuentadante y usuario
- **Cuentadante** → puede actuar como usuario

El sistema permite cambiar entre roles sin cerrar sesión mediante un selector elegante en el header.

---

## ✅ Funcionalidades Implementadas

### Autenticación y Roles
1. ✅ Login con correo y contraseña
2. ✅ Sistema de roles múltiples con selector elegante
3. ✅ Cambio de rol sin cerrar sesión
4. ✅ Priorización de roles (coordinador > administrador > cuentadante > usuario)

### Gestión de Bienes
5. ✅ Registro de bienes con placa automática (SENA-YYYY-NNNN)
6. ✅ Asignación de bienes a cuentadantes y ambientes
7. ✅ Desasignación de bienes (con validación de bloqueo)
8. ✅ Historial de asignaciones
9. ✅ Inventario completo con filtros y búsqueda
10. ✅ Sistema de bloqueo de bienes en préstamo

### Solicitudes y Firmas
11. ✅ Solicitud de bienes por usuario
12. ✅ Agrupación automática por cuentadante
13. ✅ Carrito de compras con scroll interno
14. ✅ Vista de mis solicitudes (usuario)
15. ✅ Cancelación de solicitudes pendientes
16. ✅ Sistema de firmas secuenciales (cuentadante → coordinador → administrador)
17. ✅ Vista de solicitudes para cuentadante (con firma)
18. ✅ Vista de solicitudes para coordinador (con firma condicional)
19. ✅ Vista de solicitudes para administrador (con firma condicional)
20. ✅ Indicador visual de estado de firmas
21. ✅ Botones habilitados/deshabilitados según orden de firmas

### Dashboard y Estadísticas
22. ✅ Dashboard con estadísticas dinámicas por rol
23. ✅ Stats para usuario (solicitudes activas, aprobadas, rechazadas)
24. ✅ Stats para cuentadante (bienes a cargo, disponibles, en préstamo, solicitudes pendientes)
25. ✅ Stats para coordinador (pendientes, aprobadas, rechazadas)
26. ✅ Stats para administrador (total, pendientes, aprobadas)
27. ✅ Stats para almacenista (total bienes, sin asignar, cuentadantes activos)

---

## ⏳ Pendientes

1. ⏳ Vista y funcionalidad del vigilante (autorización de salidas)
2. ⏳ Gestión de devoluciones de bienes
3. ⏳ Reportes y estadísticas avanzadas
4. ⏳ Notificaciones por correo
5. ⏳ Historial completo de movimientos
6. ⏳ Exportación de reportes (PDF/Excel)
