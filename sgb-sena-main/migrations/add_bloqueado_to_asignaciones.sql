-- ========================================
-- MIGRACIÓN: Añadir campo bloqueado a tabla asignaciones
-- Fecha: 2024-11-27
-- Descripción: Añade el campo bloqueado a la tabla asignaciones
--              para controlar si un bien está en préstamo o disponible
-- ========================================

BEGIN;

-- Añadir columna bloqueado a la tabla asignaciones
ALTER TABLE asignaciones 
ADD COLUMN bloqueado BOOLEAN DEFAULT false;

-- Actualizar registros existentes para que estén desbloqueados por defecto
UPDATE asignaciones 
SET bloqueado = false 
WHERE bloqueado IS NULL;

-- Añadir comentario a la columna
COMMENT ON COLUMN asignaciones.bloqueado IS 'Indica si el bien está en préstamo (true) o disponible (false)';

COMMIT;

-- ========================================
-- NOTAS:
-- - bloqueado = false: Bien disponible para préstamo
-- - bloqueado = true: Bien actualmente en préstamo
-- - Por defecto, al asignar un bien, estará disponible (false)
-- - Cuando se apruebe una solicitud de préstamo, se cambiará a true
-- - Cuando se devuelva el bien, se cambiará de nuevo a false
-- ========================================
