-- ========================================
-- MIGRACIÓN: Añadir campo correo a tabla persona
-- Fecha: 2024-11-27
-- Descripción: Añade el campo correo (email) a la tabla persona
--              para permitir login con correo + contraseña
-- ========================================

BEGIN;

-- Añadir columna correo a la tabla persona
ALTER TABLE persona 
ADD COLUMN correo VARCHAR(100) UNIQUE;

-- Opcional: Añadir índice para búsquedas más rápidas
CREATE INDEX idx_persona_correo ON persona(correo);

-- Opcional: Añadir constraint para validar formato de email
ALTER TABLE persona 
ADD CONSTRAINT check_correo_format 
CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMIT;

-- ========================================
-- NOTAS:
-- - El campo correo es UNIQUE para evitar duplicados
-- - Se añade un índice para mejorar el rendimiento en búsquedas
-- - Se valida el formato de email con una expresión regular
-- - Si ya tienes datos en la tabla persona, necesitarás actualizar
--   los registros existentes con correos válidos
-- ========================================
