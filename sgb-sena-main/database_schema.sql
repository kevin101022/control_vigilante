-- Creación del esquema (Opcional, si no usas 'public')
-- CREATE SCHEMA IF NOT EXISTS mydb;
-- SET search_path TO mydb;

-- -----------------------------------------------------
-- Tabla PERSONA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS PERSONA (
  pers_documento BIGINT NOT NULL,
  pers_nombres VARCHAR(45) NOT NULL,
  pers_apellidos VARCHAR(45) NOT NULL,
  pers_direccion VARCHAR(45) NOT NULL,
  pers_telefono BIGINT NOT NULL,
  pers_tipodoc VARCHAR(5) NOT NULL,
  pers_password VARCHAR(255) NOT NULL, -- Aumentado a 255 para soportar hashes de bcrypt
  pers_correo VARCHAR(100) NOT NULL,
  PRIMARY KEY (pers_documento)
);

-- -----------------------------------------------------
-- Tabla MARCA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS MARCA (
  marc_id INT NOT NULL,
  marc_nombre VARCHAR(45) NOT NULL,
  PRIMARY KEY (marc_id)
);

-- -----------------------------------------------------
-- Tabla ELEMENTO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ELEMENTO (
  elem_placa BIGINT NOT NULL,
  elem_descripcion VARCHAR(45) NOT NULL,
  elem_modelo VARCHAR(45) NOT NULL,
  MARCA_marc_id INT NOT NULL,
  elem_serial VARCHAR(45) NOT NULL,
  elem_fecha_compra TIMESTAMP NULL,
  elem_vida_util INT NULL,
  elem_costo BIGINT NULL,
  PRIMARY KEY (elem_placa),
  CONSTRAINT fk_ELEMENTO_MARCA
    FOREIGN KEY (MARCA_marc_id)
    REFERENCES MARCA (marc_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_ELEMENTO_MARCA_idx ON ELEMENTO(MARCA_marc_id);

-- -----------------------------------------------------
-- Tabla SEDE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS SEDE (
  sede_id INT NOT NULL,
  sede_nombre VARCHAR(45) NULL,
  PRIMARY KEY (sede_id)
);

-- -----------------------------------------------------
-- Tabla SOLICITUD
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS SOLICITUD (
  solic_id SERIAL NOT NULL, -- SERIAL reemplaza AUTO_INCREMENT
  solic_fecha_ini TIMESTAMP NOT NULL,
  solic_fecha_fin TIMESTAMP NULL,
  PERSONA_pers_documento BIGINT NOT NULL,
  solic_destino VARCHAR(45) NOT NULL,
  solic_motivo VARCHAR(45) NOT NULL,
  solic_estado VARCHAR(45) NOT NULL,
  solic_observaciones VARCHAR(45) NOT NULL,
  SEDE_sede_id INT NOT NULL,
  PRIMARY KEY (solic_id),
  CONSTRAINT fk_SOLICITUD_PERSONA1
    FOREIGN KEY (PERSONA_pers_documento)
    REFERENCES PERSONA (pers_documento)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_SOLICITUD_SEDE1
    FOREIGN KEY (SEDE_sede_id)
    REFERENCES SEDE (sede_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_SOLICITUD_PERSONA1_idx ON SOLICITUD(PERSONA_pers_documento);
CREATE INDEX fk_SOLICITUD_SEDE1_idx ON SOLICITUD(SEDE_sede_id);

-- -----------------------------------------------------
-- Tabla AMBIENTE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS AMBIENTE (
  amb_id INT NOT NULL,
  amb_nombre VARCHAR(45) NULL,
  SEDE_sede_id INT NOT NULL,
  PRIMARY KEY (amb_id),
  CONSTRAINT fk_AMBIENTE_SEDE1
    FOREIGN KEY (SEDE_sede_id)
    REFERENCES SEDE (sede_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_AMBIENTE_SEDE1_idx ON AMBIENTE(SEDE_sede_id);

-- -----------------------------------------------------
-- Tabla ASIGNACION
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ASIGNACION (
  ELEMENTO_elem_placa BIGINT NOT NULL,
  AMBIENTE_amb_id INT NOT NULL,
  PERSONA_pers_documento BIGINT NOT NULL,
  asig_id SERIAL NOT NULL,
  asig_fecha_ini TIMESTAMP NOT NULL,
  disponible BOOLEAN NOT NULL, -- TINYINT cambiado a BOOLEAN
  PRIMARY KEY (asig_id),
  CONSTRAINT fk_ASIGNACION_ELEMENTO1
    FOREIGN KEY (ELEMENTO_elem_placa)
    REFERENCES ELEMENTO (elem_placa)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_ASIGNACION_AMBIENTE1
    FOREIGN KEY (AMBIENTE_amb_id)
    REFERENCES AMBIENTE (amb_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_ASIGNACION_PERSONA1
    FOREIGN KEY (PERSONA_pers_documento)
    REFERENCES PERSONA (pers_documento)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_ASIGNACION_AMBIENTE1_idx ON ASIGNACION(AMBIENTE_amb_id);
CREATE INDEX fk_ASIGNACION_PERSONA1_idx ON ASIGNACION(PERSONA_pers_documento);

-- -----------------------------------------------------
-- Tabla ROL
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ROL (
  rol_id INT NOT NULL,
  rol_nombre VARCHAR(45) NULL,
  PRIMARY KEY (rol_id)
);

-- -----------------------------------------------------
-- Tabla ROL_PERSONA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ROL_PERSONA (
  ROL_rol_id INT NOT NULL,
  PERSONA_pers_documento BIGINT NOT NULL,
  SEDE_sede_id INT NOT NULL,
  PRIMARY KEY (ROL_rol_id, PERSONA_pers_documento),
  CONSTRAINT fk_ROL_PERSONA_ROL1
    FOREIGN KEY (ROL_rol_id)
    REFERENCES ROL (rol_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_ROL_PERSONA_PERSONA1
    FOREIGN KEY (PERSONA_pers_documento)
    REFERENCES PERSONA (pers_documento)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_ROL_PERSONA_SEDE1
    FOREIGN KEY (SEDE_sede_id)
    REFERENCES SEDE (sede_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_ROL_PERSONA_PERSONA1_idx ON ROL_PERSONA(PERSONA_pers_documento);
CREATE INDEX fk_ROL_PERSONA_SEDE1_idx ON ROL_PERSONA(SEDE_sede_id);

-- -----------------------------------------------------
-- Tabla DETALLE_SOLICITUD
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS DETALLE_SOLICITUD (
  detsolic_id SERIAL NOT NULL,
  SOLICITUD_solic_id INT NOT NULL,
  ASIGNACION_asig_id INT NOT NULL,
  PRIMARY KEY (detsolic_id, SOLICITUD_solic_id),
  CONSTRAINT fk_DETALLE_SOLICITUD_SOLICITUD1
    FOREIGN KEY (SOLICITUD_solic_id)
    REFERENCES SOLICITUD (solic_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_DETALLE_SOLICITUD_ASIGNACION1
    FOREIGN KEY (ASIGNACION_asig_id)
    REFERENCES ASIGNACION (asig_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_DETALLE_SOLICITUD_SOLICITUD1_idx ON DETALLE_SOLICITUD(SOLICITUD_solic_id);
CREATE INDEX fk_DETALLE_SOLICITUD_ASIGNACION1_idx ON DETALLE_SOLICITUD(ASIGNACION_asig_id);

-- -----------------------------------------------------
-- Tabla ESTADOxELEMENTO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ESTADOxELEMENTO (
  ELEMENTO_elem_placa BIGINT NOT NULL,
  est_elem_id VARCHAR(45) NOT NULL,
  estado VARCHAR(45) NOT NULL,
  est_fecha_registro TIMESTAMP NULL,
  PRIMARY KEY (est_elem_id),
  CONSTRAINT fk_ESTADOxELEMENTO_ELEMENTO1
    FOREIGN KEY (ELEMENTO_elem_placa)
    REFERENCES ELEMENTO (elem_placa)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_ESTADOxELEMENTO_ELEMENTO1_idx ON ESTADOxELEMENTO(ELEMENTO_elem_placa);

-- -----------------------------------------------------
-- Tabla FIRMA_SOLICITUD
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS FIRMA_SOLICITUD (
  SOLICITUD_solic_id INT NOT NULL,
  firm_id VARCHAR(45) NULL,
  ROL_PERSONA_ROL_rol_id INT NOT NULL,
  ROL_PERSONA_PERSONA_pers_documento BIGINT NOT NULL,
  firm_firmado BOOLEAN NOT NULL, -- TINYINT cambiado a BOOLEAN
  firm_observacion VARCHAR(45) NOT NULL,
  firm_fecha_firmado TIMESTAMP NULL,
  CONSTRAINT fk_FIRMA_SOLICITUD_SOLICITUD1
    FOREIGN KEY (SOLICITUD_solic_id)
    REFERENCES SOLICITUD (solic_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_FIRMA_SOLICITUD_ROL_PERSONA1
    FOREIGN KEY (ROL_PERSONA_ROL_rol_id, ROL_PERSONA_PERSONA_pers_documento)
    REFERENCES ROL_PERSONA (ROL_rol_id, PERSONA_pers_documento)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_FIRMA_SOLICITUD_SOLICITUD1_idx ON FIRMA_SOLICITUD(SOLICITUD_solic_id);
CREATE INDEX fk_FIRMA_SOLICITUD_ROL_PERSONA1_idx ON FIRMA_SOLICITUD(ROL_PERSONA_ROL_rol_id, ROL_PERSONA_PERSONA_pers_documento);

-- -----------------------------------------------------
-- Tabla BITACORA_VIGILANCIA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS BITACORA_VIGILANCIA (
  bit_id SERIAL PRIMARY KEY,
  bit_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bit_tipo VARCHAR(20) NOT NULL, -- 'SALIDA' o 'REINGRESO'
  SOLICITUD_solic_id INT NOT NULL,
  PERSONA_pers_documento BIGINT NOT NULL, -- Vigilante que registra
  bit_observaciones TEXT,
  CONSTRAINT fk_BITACORA_SOLICITUD
    FOREIGN KEY (SOLICITUD_solic_id)
    REFERENCES SOLICITUD (solic_id),
  CONSTRAINT fk_BITACORA_PERSONA
    FOREIGN KEY (PERSONA_pers_documento)
    REFERENCES PERSONA (pers_documento)
);

-- -----------------------------------------------------
-- Tabla DETALLE_BITACORA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS DETALLE_BITACORA (
  detbit_id SERIAL PRIMARY KEY,
  BITACORA_bit_id INT NOT NULL,
  ELEMENTO_elem_placa BIGINT NOT NULL,
  detbit_estado VARCHAR(20) NOT NULL, -- 'SALIO', 'NO_SALIO', 'REINGRESO'
  CONSTRAINT fk_DETALLE_BITACORA_BITACORA
    FOREIGN KEY (BITACORA_bit_id)
    REFERENCES BITACORA_VIGILANCIA (bit_id),
  CONSTRAINT fk_DETALLE_BITACORA_ELEMENTO
    FOREIGN KEY (ELEMENTO_elem_placa)
    REFERENCES ELEMENTO (elem_placa)
);
