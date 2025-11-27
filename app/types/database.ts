// Tipos TypeScript basados en la estructura de PostgreSQL
// Estos tipos mapean directamente las tablas de la base de datos

export interface Persona {
    pers_documento: number;
    pers_nombres: string;
    pers_apellidos: string;
    pers_direccion: string;
    pers_telefono: number;
    pers_tipodoc: string;
    pers_password: string;
}

export interface Marca {
    marc_id: number;
    marc_nombre: string;
}

export interface Elemento {
    elem_placa: number;
    elem_descripcion: string;
    elem_modelo: string;
    MARCA_marc_id: number;
    elem_serial: string;
    elem_fecha_compra?: Date;
    elem_vida_util?: number;
    elem_costo?: number;
    // Relación con Marca
    marca?: Marca;
}

export interface Sede {
    sede_id: number;
    sede_nombre: string;
}

export interface Solicitud {
    solic_id: number;
    solic_fecha_ini: Date;
    solic_fecha_fin?: Date;
    PERSONA_pers_documento: number;
    solic_destino: string;
    solic_motivo: string;
    solic_estado: string; // Estados posibles: 'PENDIENTE', 'APROBADA', 'EN_TRANSITO', 'FINALIZADA', 'RECHAZADA'
    solic_observaciones: string;
    SEDE_sede_id: number;
    // Relaciones
    persona?: Persona;
    sede?: Sede;
    firmas?: FirmaSolicitud[];
    detalles?: DetalleSolicitud[];
}

export interface Asignacion {
    asig_id: number;
    ELEMENTO_elem_placa: number;
    AMBIENTE_amb_id: number;
    PERSONA_pers_documento: number;
    asig_fecha_ini: Date;
    // Relaciones
    elemento?: Elemento;
    persona?: Persona;
}

export interface DetalleSolicitud {
    detsolic_id: number;
    SOLICITUD_solic_id: number;
    ASIGNACION_asig_id: number;
    // Relaciones
    asignacion?: Asignacion;
}

export interface Rol {
    rol_id: number;
    rol_nombre: string; // Ej: 'CUENTADANTE', 'ADMIN_EDIFICIO', 'COORDINADOR', 'VIGILANTE'
}

export interface RolPersona {
    ROL_rol_id: number;
    PERSONA_pers_documento: number;
    SEDE_sede_id: number;
    // Relaciones
    rol?: Rol;
    persona?: Persona;
    sede?: Sede;
}

export interface FirmaSolicitud {
    firm_id?: string;
    SOLICITUD_solic_id: number;
    ROL_PERSONA_ROL_rol_id: number;
    ROL_PERSONA_PERSONA_pers_documento: number;
    firm_firmado: boolean; // TINYINT -> boolean
    firm_observacion: string;
    firm_fecha_firmado?: Date;
    // Relaciones
    rol_persona?: RolPersona;
}

export interface EstadoElemento {
    est_elem_id: string;
    ELEMENTO_elem_placa: number;
    estado: string; // Estados: 'EN_SITIO', 'AFUERA', 'NO_SALIO', 'MANTENIMIENTO', etc.
    est_fecha_registro?: Date;
}

// Tipos para el dashboard del vigilante
export interface SolicitudConDetalles extends Solicitud {
    persona_nombre_completo: string;
    elementos: ElementoConMarca[];
    firmas_completas: boolean;
    firma_cuentadante: boolean;
    firma_admin: boolean;
    firma_coordinador: boolean;
}

export interface ElementoConMarca extends Elemento {
    marca_nombre: string;
    estado_actual: string; // Estado del elemento en este momento
}

// Tipo para la bitácora del vigilante
export interface BitacoraRegistro {
    registro_id: string;
    timestamp: Date;
    tipo: 'SALIDA' | 'REINGRESO';
    solicitud_id: number;
    solicitante_nombre: string;
    elementos_count: number;
    elementos_seriales: string[];
    sede_nombre: string;
    observaciones?: string;
}
