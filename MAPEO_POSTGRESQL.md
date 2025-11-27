# Mapeo de Campos: Frontend Actual → PostgreSQL

Este documento muestra cómo los campos actuales del dashboard del vigilante se mapean a la estructura de la base de datos PostgreSQL.

## Resumen

El dashboard actual funciona perfectamente con datos mock. Cuando llegue el momento de conectar a PostgreSQL, solo necesitarás cambiar los nombres de los campos según este mapeo.

---

## 📋 Autorización/Solicitud

| Campo Actual | Campo PostgreSQL | Tipo | Descripción |
|--------------|------------------|------|-------------|
| `id` | `solic_id` | `number` | ID único de la solicitud |
| `solicitante` | `persona_nombre_completo` | `string` | Nombre completo del solicitante |
| `uso_motivo` | `solic_motivo` | `string` | Motivo de la salida |
| `destino` | `solic_destino` | `string` | Lugar de destino |
| `fecha_salida` | `solic_fecha_ini` | `Date` | Fecha de inicio/salida |
| `fecha_limite_regreso` | `solic_fecha_fin` | `Date` | Fecha límite de regreso |
| `estado_firmas.cuentadante` | `firma_cuentadante` | `boolean` | Firma del cuentadante |
| `estado_firmas.admin` | `firma_admin` | `boolean` | Firma del admin del edificio |
| `estado_firmas.coordinador` | `firma_coordinador` | `boolean` | Firma del coordinador |
| `bienes` | `elementos` | `Array` | Lista de elementos asociados |

---

## 🏷️  Bienes/Elementos

| Campo Actual | Campo PostgreSQL | Tipo | Descripción |
|--------------|------------------|------|-------------|
| `nombre` | `elem_descripcion` | `string` | Descripción del elemento |
| `marca` | `marca_nombre` | `string` | Nombre de la marca |
| `modelo` | `elem_modelo` | `string` | Modelo del elemento |
| `placa` | `elem_placa` | `number` | Placa inventario SENA |
| `serial` | `elem_serial` | `string` | Número de serial |
| `estado` | `estado_actual` | `string` | Estado: EN_SITIO, AFUERA, NO_SALIO |

---

## 🗂️ Tablas PostgreSQL Necesarias

### Tablas Principales para el Módulo de Vigilante:

1. **SOLICITUD** - Autorizaciones de salida
   - Relacionada con PERSONA (solicitante)
   - Relacionada con SEDE (lugar de salida)
   
2. **ELEMENTO** - Bienes del SENA
   - Relacionada con MARCA

3. **DETALLE_SOLICITUD** - Relación solicitud ↔ elementos

4. **FIRMA_SOLICITUD** - Firmas de aprobación
   - Requiere 3 firmas: Cuentadante, Admin Edificio, Coordinador

5. **ESTADOxELEMENTO** - Estado actual de cada elemento
   - Estados: EN_SITIO, AFUERA, NO_SALIO, MANTENIMIENTO

---

## 🔄 Query de Ejemplo para Obtener Datos del Vigilante

```sql
-- Obtener solicitudes pendientes con sus elementos para SALIDA
SELECT 
    s.solic_id,
    s.solic_fecha_ini,
    s.solic_fecha_fin,
    s.solic_destino,
    s.solic_motivo,
    s.solic_estado,
    CONCAT(p.pers_nombres, ' ', p.pers_apellidos) as persona_nombre_completo,
    sd.sede_nombre,
    -- Firmas
    MAX(CASE WHEN rp.ROL_rol_id = 1 THEN fs.firm_firmado ELSE 0 END) as firma_cuentadante,
    MAX(CASE WHEN rp.ROL_rol_id = 2 THEN fs.firm_firmado ELSE 0 END) as firma_admin,
    MAX(CASE WHEN rp.ROL_rol_id = 3 THEN fs.firm_firmado ELSE 0 END) as firma_coordinador
FROM SOLICITUD s
INNER JOIN PERSONA p ON s.PERSONA_pers_documento = p.pers_documento
INNER JOIN SEDE sd ON s.SEDE_sede_id = sd.sede_id
LEFT JOIN FIRMA_SOLICITUD fs ON s.solic_id = fs.SOLICITUD_solic_id
LEFT JOIN ROL_PERSONA rp ON fs.ROL_PERSONA_ROL_rol_id = rp.ROL_rol_id 
    AND fs.ROL_PERSONA_PERSONA_pers_documento = rp.PERSONA_pers_documento
WHERE s.solic_estado = 'APROBADA'
GROUP BY s.solic_id, p.pers_nombres, p.pers_apellidos, sd.sede_nombre;

-- Obtener elementos de una solicitud
SELECT 
    e.elem_placa,
    e.elem_serial,
    e.elem_descripcion,
    e.elem_modelo,
    m.marc_nombre as marca_nombre,
    ee.estado as estado_actual
FROM DETALLE_SOLICITUD ds
INNER JOIN ASIGNACION a ON ds.ASIGNACION_asig_id = a.asig_id
INNER JOIN ELEMENTO e ON a.ELEMENTO_elem_placa = e.elem_placa
INNER JOIN MARCA m ON e.MARCA_marc_id = m.marc_id
LEFT JOIN ESTADOxELEMENTO ee ON e.elem_placa = ee.ELEMENTO_elem_placa
WHERE ds.SOLICITUD_solic_id = ?
AND ee.est_fecha_registro = (
    SELECT MAX(est_fecha_registro) 
    FROM ESTADOxELEMENTO 
    WHERE ELEMENTO_elem_placa = e.elem_placa
);
```

---

## ✅ Estado Actual del Proyecto

- ✅ **Tipos TypeScript creados** en `app/types/database.ts`
- ✅ **Dashboard funcionando** con datos mock y nombres actuales
- ⏸️ **Pendiente**: Cuando conectes PostgreSQL, actualizar nombres de campos según este mapeo
- ⏸️ **Pendiente**: Crear APIs/endpoints para obtener datos de PostgreSQL

---

## 📝 Notas Importantes

1. **No cambies el código ahora** - El dashboard funciona perfectamente como está
2. **Cuando conectes PostgreSQL**: Usa este documento como referencia para saber qué campos mapear
3. **Los tipos ya están listos** en `database.ts` - Allí están todos los interfaces que necesitarás
4. **El diseño visual NO cambia** - Solo los nombres de datos internos

---

## 🎯 Próximos Pasos (Futuro)

Cuando estés listo para conectar PostgreSQL:

1. Crear backend/API con endpoints para:
   - GET `/api/solicitudes/pendientes` (para SALIDA)
   - GET `/api/solicitudes/transito` (para REINGRESO)
   - POST `/api/salida/registrar`
   - POST `/api/reingreso/registrar`
   - GET `/api/bitacora`

2. Reemplazar `initialMockData` con llamadas a tu API

3. Actualizar nombres de campos según este mapeo

4. ¡Listo! El diseño y funcionalidad ya están completos.
