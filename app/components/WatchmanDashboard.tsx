'use client';

import React, { useState, useMemo } from 'react';
import {
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    LogOut,
    LogIn,
    Clock,
    FileText,
    History,
    Calendar,
    X,
    ArrowLeft,
    User,
    ChevronDown
} from 'lucide-react';

// Initial Mock Data
const initialMockData = [
    {
        id: "AUT-2024-001",
        solicitante: "Juan Pérez (Instructor)",
        estado_firmas: { cuentadante: true, admin: true, coordinador: true },
        uso_motivo: "Capacitación externa",
        destino: "Sede Norte - Salón 301",
        fecha_salida: "2024-11-24",
        fecha_limite_regreso: "2024-11-25",
        bienes: [
            { serial: "PC-HP-001", nombre: "Portátil HP ProBook", marca: "HP", modelo: "ProBook 450 G8", placa: "SENA-001", estado: "En Sitio" },
            { serial: "TAB-SAM-099", nombre: "Tablet Samsung S6", marca: "Samsung", modelo: "Galaxy Tab S6", placa: "SENA-099", estado: "En Sitio" }
        ]
    },
    {
        id: "AUT-2024-002",
        solicitante: "Maria Gomez (Administrativa)",
        estado_firmas: { cuentadante: true, admin: false, coordinador: true },
        uso_motivo: "Presentación institucional",
        destino: "Auditorio Principal",
        fecha_salida: "2024-11-24",
        fecha_limite_regreso: "2024-11-24",
        bienes: [
            { serial: "PROY-EPS-200", nombre: "Video Beam Epson", marca: "Epson", modelo: "PowerLite X49", placa: "SENA-200", estado: "En Sitio" }
        ]
    },
    {
        id: "AUT-2024-003",
        solicitante: "Carlos Ruiz (Contratista)",
        estado_firmas: { cuentadante: true, admin: true, coordinador: true },
        uso_motivo: "Registro fotográfico evento",
        destino: "Centro Comercial Andino",
        fecha_salida: "2024-11-23",
        fecha_limite_regreso: "2024-11-24",
        bienes: [
            { serial: "CAM-CAN-500", nombre: "Cámara Canon EOS", marca: "Canon", modelo: "EOS 90D", placa: "SENA-500", estado: "Afuera" }
        ]
    }
];

type Tab = 'SALIDA' | 'REINGRESO' | 'BITACORA';

interface Authorization {
    id: string;
    solicitante: string;
    estado_firmas: {
        cuentadante: boolean;
        admin: boolean;
        coordinador: boolean;
    };
    uso_motivo: string;
    destino: string;
    fecha_salida: string;
    fecha_limite_regreso: string;
    bienes: Array<{
        serial: string;
        nombre: string;
        marca: string;
        modelo: string;
        placa: string;
        estado: string;
    }>;
}

interface LogEntry {
    id: string;
    timestamp: Date;
    tipo: 'SALIDA' | 'REINGRESO';
    autorizacionId: string;
    solicitante: string;
    bienesCount: number;
    bienes: string[];
    observaciones?: string;
    bienesNoSalieron?: Array<{ serial: string; nombre: string; motivo: string }>;
}

export default function WatchmanDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('SALIDA');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentAuth, setCurrentAuth] = useState<Authorization | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [observations, setObservations] = useState('');
    const [exitLocation, setExitLocation] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [itemObservations, setItemObservations] = useState<Record<string, string>>({});
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    // Mutable state for authorizations and log
    const [authorizations, setAuthorizations] = useState<Authorization[]>(initialMockData);
    const [actionLog, setActionLog] = useState<LogEntry[]>([]);

    // Simulate async search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setCurrentAuth(null);
        setSelectedItems([]);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const found = authorizations.find(
            auth =>
                auth.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                auth.solicitante.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setCurrentAuth(found || null);
        setIsSearching(false);
    };

    // Validation logic - all 3 signatures required
    const validationStatus = useMemo(() => {
        if (!currentAuth) return { isValid: false, missingSignatures: [] };

        const missing: string[] = [];
        if (!currentAuth.estado_firmas.cuentadante) missing.push('Cuentadante');
        if (!currentAuth.estado_firmas.admin) missing.push('Admin Edificio');
        if (!currentAuth.estado_firmas.coordinador) missing.push('Coordinador');

        return {
            isValid: missing.length === 0,
            missingSignatures: missing
        };
    }, [currentAuth]);

    // Handle item checkbox toggle
    const toggleItem = (serial: string) => {
        setSelectedItems(prev =>
            prev.includes(serial)
                ? prev.filter(s => s !== serial)
                : [...prev, serial]
        );
    };

    // Register Exit - Updates state and logs action
    const handleRegisterExit = () => {
        if (!currentAuth) return;

        const now = new Date();

        // Update authorization state - change selected items to "Afuera" and unselected to "No Salió"
        setAuthorizations(prevAuths =>
            prevAuths.map(auth => {
                if (auth.id === currentAuth.id) {
                    return {
                        ...auth,
                        bienes: auth.bienes.map(bien => {
                            if (selectedItems.includes(bien.serial)) {
                                return { ...bien, estado: "Afuera" };
                            } else if (bien.estado === "En Sitio") {
                                // Si no fue seleccionado y estaba "En Sitio", marcarlo como "No Salió"
                                return { ...bien, estado: "No Salió" };
                            }
                            return bien;
                        })
                    };
                }
                return auth;
            })
        );

        // Preparar información de bienes que NO salieron
        const bienesNoSalieron = currentAuth.bienes
            .filter(bien => !selectedItems.includes(bien.serial))
            .map(bien => ({
                serial: bien.serial,
                nombre: bien.nombre,
                motivo: itemObservations[bien.serial] || ''
            }));

        // Add to action log
        const logEntry: LogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: now,
            tipo: 'SALIDA',
            autorizacionId: currentAuth.id,
            solicitante: currentAuth.solicitante,
            bienesCount: selectedItems.length,
            bienes: selectedItems,
            bienesNoSalieron: bienesNoSalieron.length > 0 ? bienesNoSalieron : undefined
        };
        setActionLog(prev => [logEntry, ...prev]);

        console.log('Salida Registrada:', logEntry);

        setShowSuccessModal(true);
    };

    // Close success modal and reset form
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setCurrentAuth(null);
        setSearchQuery('');
        setSelectedItems([]);
        setObservations('');
        setExitLocation('');
        setItemObservations({});
    };

    // Register Re-entry - Updates state and logs action
    const handleRegisterReentry = () => {
        if (!currentAuth) return;

        const now = new Date();
        // Solo reingresar los bienes que están "Afuera"
        const bienesAfuera = currentAuth.bienes.filter(b => b.estado === "Afuera");
        const bienesAfueraSerials = bienesAfuera.map(b => b.serial);

        // Update authorization state - change only "Afuera" items back to "En Sitio"
        setAuthorizations(prevAuths =>
            prevAuths.map(auth => {
                if (auth.id === currentAuth.id) {
                    return {
                        ...auth,
                        bienes: auth.bienes.map(bien => 
                            bien.estado === "Afuera" ? { ...bien, estado: "En Sitio" } : bien
                        )
                    };
                }
                return auth;
            })
        );

        // Add to action log
        const logEntry: LogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: now,
            tipo: 'REINGRESO',
            autorizacionId: currentAuth.id,
            solicitante: currentAuth.solicitante,
            bienesCount: bienesAfuera.length,
            bienes: bienesAfueraSerials,
            observaciones: observations || undefined
        };
        setActionLog(prev => [logEntry, ...prev]);

        console.log('Reingreso Registrado:', logEntry);

        setShowSuccessModal(true);
    };

    // Validación para registro de salida
    const canRegisterExit = useMemo(() => {
        if (!validationStatus.isValid || selectedItems.length === 0 || exitLocation.trim() === '') {
            return false;
        }
        
        // Si hay bienes y hay varios bienes en la autorización
        if (currentAuth && currentAuth.bienes.length > 1) {
            // Verificar que todos los bienes NO seleccionados tengan observación
            const unselectedItems = currentAuth.bienes.filter(b => !selectedItems.includes(b.serial));
            const allUnselectedHaveObservations = unselectedItems.every(
                bien => itemObservations[bien.serial]?.trim() !== '' && itemObservations[bien.serial] !== undefined
            );
            
            // Si hay bienes no seleccionados, deben tener observación
            if (unselectedItems.length > 0 && !allUnselectedHaveObservations) {
                return false;
            }
        }
        
        return true;
    }, [validationStatus.isValid, selectedItems, exitLocation, currentAuth, itemObservations]);

    // Filter authorizations for SALIDA table (only show items "En Sitio")
    const filteredAuthorizations = useMemo(() => {
        return authorizations
            .filter(auth =>
                auth.bienes.some(b => b.estado === "En Sitio")
            )
            .filter(auth => {
                if (!searchQuery.trim()) return true;
                const searchTerm = searchQuery.toLowerCase();
                return (
                    auth.id.toLowerCase().includes(searchTerm) ||
                    auth.solicitante.toLowerCase().includes(searchTerm)
                );
            });
    }, [searchQuery, authorizations]);

    // Filter authorizations for REINGRESO table (only show items "Afuera")
    const filteredTransitAuthorizations = useMemo(() => {
        return authorizations
            .filter(auth =>
                auth.bienes.some(b => b.estado === "Afuera")
            )
            .filter(auth => {
                if (!searchQuery.trim()) return true;
                const searchTerm = searchQuery.toLowerCase();
                return (
                    auth.id.toLowerCase().includes(searchTerm) ||
                    auth.solicitante.toLowerCase().includes(searchTerm)
                );
            });
    }, [searchQuery, authorizations]);

    // Filter action log
    const filteredActionLog = useMemo(() => {
        if (!searchQuery.trim()) return actionLog;
        const searchTerm = searchQuery.toLowerCase();
        return actionLog.filter(log =>
            log.autorizacionId.toLowerCase().includes(searchTerm) ||
            log.solicitante.toLowerCase().includes(searchTerm) ||
            log.tipo.toLowerCase().includes(searchTerm)
        );
    }, [searchQuery, actionLog]);

    // Get signature status for table display
    const getSignatureStatus = (auth: Authorization) => {
        const { cuentadante, admin, coordinador } = auth.estado_firmas;
        const complete = cuentadante && admin && coordinador;
        const count = [cuentadante, admin, coordinador].filter(Boolean).length;
        return { complete, count, total: 3 };
    };

    // Handle clicking on an authorization from the table
    const handleSelectFromTable = (authId: string) => {
        const found = authorizations.find(auth => auth.id === authId);
        if (found) {
            setCurrentAuth(found);
            setSelectedItems([]);
            setSearchQuery(authId);
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header */}
            <header className="bg-[#39A900] shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://res.cloudinary.com/dil3rjo71/image/upload/v1763990215/logo-de-Sena-sin-fondo-Blanco-300x300_tlss3c.webp"
                            alt="SENA Logo"
                            className="h-12 w-12 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="h-12 w-px bg-white opacity-50"></div>
                        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: '"Work Sans", sans-serif' }}>
                            Control de Vigilancia
                        </h1>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <User className="h-6 w-6 text-white" />
                            <p className="text-white font-bold text-base">Vigilante</p>
                            <ChevronDown className={`h-5 w-5 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                <button
                                    onClick={() => {
                                        // Aquí iría la lógica de cerrar sesión
                                        console.log('Cerrando sesión...');
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2 font-semibold"
                                >
                                    <LogOut className="h-4 w-4 text-red-600" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button - Only show when viewing authorization details */}
                {currentAuth && (
                    <button
                        onClick={() => {
                            setCurrentAuth(null);
                            setSearchQuery('');
                            setSelectedItems([]);
                            setObservations('');
                            setExitLocation('');
                            setItemObservations({});
                        }}
                        className="mb-4 flex items-center gap-2 px-4 py-2 text-[#39A900] hover:text-[#007832] font-bold transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Volver
                    </button>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => {
                            setActiveTab('SALIDA');
                            setCurrentAuth(null);
                            setSearchQuery('');
                            setSelectedItems([]);
                            setItemObservations({});
                        }}
                        className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'SALIDA'
                            ? 'text-[#39A900] border-b-2 border-[#39A900]'
                            : 'text-gray-900 hover:text-black'
                            }`}
                    >
                        <LogOut className="inline-block mr-2 h-5 w-5" />
                        SALIDA
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('REINGRESO');
                            setCurrentAuth(null);
                            setSearchQuery('');
                            setObservations('');
                        }}
                        className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'REINGRESO'
                            ? 'text-[#39A900] border-b-2 border-[#39A900]'
                            : 'text-gray-900 hover:text-black'
                            }`}
                    >
                        <LogIn className="inline-block mr-2 h-5 w-5" />
                        REINGRESO
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('BITACORA');
                            setCurrentAuth(null);
                            setSearchQuery('');
                        }}
                        className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'BITACORA'
                            ? 'text-[#39A900] border-b-2 border-[#39A900]'
                            : 'text-gray-900 hover:text-black'
                            }`}
                    >
                        <History className="inline-block mr-2 h-5 w-5" />
                        BITÁCORA
                    </button>
                </div>

                {/* Central Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        {activeTab === 'BITACORA'
                            ? 'Buscar en bitácora por código, solicitante o tipo de acción'
                            : 'Buscar por Código de Autorización o Nombre del Solicitante'
                        }
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && activeTab !== 'BITACORA' && handleSearch()}
                            placeholder={
                                activeTab === 'BITACORA'
                                    ? 'Ej: SALIDA, REINGRESO, AUT-2024-001...'
                                    : 'Ej: AUT-2024-001 o Juan Pérez'
                            }
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none text-lg text-gray-900 placeholder-gray-500 font-medium"
                            disabled={isSearching}
                        />
                        {activeTab !== 'BITACORA' && (
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="px-6 py-3 bg-[#39A900] text-white rounded-lg font-bold hover:bg-[#007832] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Search className="h-5 w-5" />
                                {isSearching ? 'Buscando...' : 'Buscar'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Pending Authorizations Table - Only in SALIDA tab */}
                {activeTab === 'SALIDA' && !currentAuth && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-[#00304D]" />
                                <h2 className="text-xl font-bold text-[#00304D]">
                                    Autorizaciones Pendientes
                                </h2>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {filteredAuthorizations.length} autorización(es)
                            </span>
                        </div>

                        {filteredAuthorizations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Código</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Solicitante</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Bienes</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Firmas</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAuthorizations.map((auth) => {
                                            const sigStatus = getSignatureStatus(auth);
                                            return (
                                                <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-[#00304D] text-base">{auth.id}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-900 font-bold">{auth.solicitante}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900 font-bold">
                                                            {auth.bienes.filter(b => b.estado === "En Sitio").length} bien(es)
                                                        </div>
                                                        <div className="text-xs text-gray-900 font-semibold">
                                                            {auth.bienes.filter(b => b.estado === "En Sitio").slice(0, 2).map(b => b.serial).join(', ')}
                                                            {auth.bienes.filter(b => b.estado === "En Sitio").length > 2 && '...'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-base font-bold ${sigStatus.complete ? 'text-[#39A900]' : 'text-gray-900'}`}>
                                                            {sigStatus.count}/{sigStatus.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {sigStatus.complete ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Completa
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleSelectFromTable(auth.id)}
                                                            className="px-3 py-1.5 text-sm font-bold bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition-colors"
                                                        >
                                                            Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-900 font-semibold">No se encontraron autorizaciones con el filtro aplicado</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Assets in Transit Table - Only in REINGRESO tab */}
                {activeTab === 'REINGRESO' && !currentAuth && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-[#00304D]" />
                                <h2 className="text-xl font-bold text-[#00304D]">
                                    Bienes en Tránsito
                                </h2>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {filteredTransitAuthorizations.length} autorización(es)
                            </span>
                        </div>

                        {filteredTransitAuthorizations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Código</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Solicitante</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Bienes</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Firmas</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredTransitAuthorizations.map((auth) => {
                                            const sigStatus = getSignatureStatus(auth);
                                            return (
                                                <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-[#00304D] text-base">{auth.id}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-900 font-bold">{auth.solicitante}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900 font-bold">
                                                            {auth.bienes.filter(b => b.estado === "Afuera").length} bien(es)
                                                        </div>
                                                        <div className="text-xs text-gray-900 font-semibold">
                                                            {auth.bienes.filter(b => b.estado === "Afuera").slice(0, 2).map(b => b.serial).join(', ')}
                                                            {auth.bienes.filter(b => b.estado === "Afuera").length > 2 && '...'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-base font-bold ${sigStatus.complete ? 'text-[#39A900]' : 'text-gray-900'}`}>
                                                            {sigStatus.count}/{sigStatus.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900">
                                                            En Tránsito
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleSelectFromTable(auth.id)}
                                                            className="px-3 py-1.5 text-sm font-bold bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition-colors"
                                                        >
                                                            Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-900 font-semibold">No hay bienes en tránsito en este momento</p>
                            </div>
                        )}
                    </div>
                )}

                {/* BITÁCORA Table - Only in BITACORA tab */}
                {activeTab === 'BITACORA' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <History className="h-6 w-6 text-[#00304D]" />
                                <h2 className="text-xl font-bold text-[#00304D]">
                                    Bitácora de Acciones
                                </h2>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {filteredActionLog.length} registro(s)
                            </span>
                        </div>

                        {filteredActionLog.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Fecha/Hora</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Código</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Solicitante</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Bienes</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Observaciones</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredActionLog.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {log.timestamp.toLocaleDateString('es-CO')}
                                                    </div>
                                                    <div className="text-xs text-gray-900 font-semibold">
                                                        {log.timestamp.toLocaleTimeString('es-CO')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {log.tipo === 'SALIDA' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900">
                                                            <LogOut className="h-3 w-3 mr-1" />
                                                            SALIDA
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900">
                                                            <LogIn className="h-3 w-3 mr-1" />
                                                            REINGRESO
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-[#00304D] text-base">{log.autorizacionId}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900 font-bold">{log.solicitante}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="text-sm text-gray-900 font-bold">{log.bienesCount} bien(es)</div>
                                                    <div className="text-xs text-gray-900 font-semibold">
                                                        {log.bienes.slice(0, 2).join(', ')}
                                                        {log.bienes.length > 2 && '...'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {log.observaciones || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-3 py-1.5 text-sm font-bold bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition-colors"
                                                    >
                                                        Ver más
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-900 font-semibold">No hay registros en la bitácora</p>
                                <p className="text-sm text-gray-500 mt-1">Las acciones de salida y reingreso se mostrarán aquí</p>
                            </div>
                        )}
                    </div>
                )}

                {/* SALIDA Authorization Details */}
                {currentAuth && activeTab === 'SALIDA' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-[#00304D] mb-4">
                                Autorización: {currentAuth.id}
                            </h2>
                            
                            {/* Información de la Autorización */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Nombre Solicitante</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.solicitante}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Uso o Motivo</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.uso_motivo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Destino</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.destino}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Fecha Real de Salida Registrada</p>
                                    {(() => {
                                        const exitLog = actionLog.find(
                                            log => log.tipo === 'SALIDA' && log.autorizacionId === currentAuth.id
                                        );

                                        if (exitLog) {
                                            return (
                                                <div>
                                                    <p className="text-gray-900 font-semibold text-base">
                                                        {exitLog.timestamp.toLocaleDateString('es-CO', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-900 font-semibold mt-0.5">
                                                        Hora: {exitLog.timestamp.toLocaleTimeString('es-CO')}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return <p className="text-gray-900 font-semibold text-base">Pendiente de registro</p>;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Fecha Límite de Regreso</p>
                                    <p className="text-gray-900 font-semibold text-base">
                                        {new Date(currentAuth.fecha_limite_regreso).toLocaleDateString('es-CO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-900">Estado de Firmas Digitales:</h3>

                                {!validationStatus.isValid && (
                                    <div className="bg-red-50 border-2 border-[#DC2626] rounded-lg p-4 flex items-start gap-3">
                                        <AlertTriangle className="h-6 w-6 text-[#DC2626] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-[#DC2626] text-lg">
                                                ⚠️ FALTAN AUTORIZACIONES
                                            </p>
                                            <p className="text-[#DC2626] font-semibold mt-1">
                                                Firmas pendientes: {validationStatus.missingSignatures.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`p-4 rounded-lg border-2 ${currentAuth.estado_firmas.cuentadante
                                        ? 'bg-green-50 border-[#39A900]'
                                        : 'bg-red-50 border-[#DC2626]'
                                        }`}>
                                        {currentAuth.estado_firmas.cuentadante ? (
                                            <CheckCircle className="h-5 w-5 text-[#39A900] inline-block mr-2" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-[#DC2626] inline-block mr-2" />
                                        )}
                                        <span className="font-bold text-gray-900">Cuentadante</span>
                                    </div>

                                    <div className={`p-4 rounded-lg border-2 ${currentAuth.estado_firmas.admin
                                        ? 'bg-green-50 border-[#39A900]'
                                        : 'bg-red-50 border-[#DC2626]'
                                        }`}>
                                        {currentAuth.estado_firmas.admin ? (
                                            <CheckCircle className="h-5 w-5 text-[#39A900] inline-block mr-2" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-[#DC2626] inline-block mr-2" />
                                        )}
                                        <span className="font-bold text-gray-900">Admin Edificio</span>
                                    </div>

                                    <div className={`p-4 rounded-lg border-2 ${currentAuth.estado_firmas.coordinador
                                        ? 'bg-green-50 border-[#39A900]'
                                        : 'bg-red-50 border-[#DC2626]'
                                        }`}>
                                        {currentAuth.estado_firmas.coordinador ? (
                                            <CheckCircle className="h-5 w-5 text-[#39A900] inline-block mr-2" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-[#DC2626] inline-block mr-2" />
                                        )}
                                        <span className="font-bold text-gray-900">Coordinador</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[#00304D]">
                                    Bienes Asociados
                                </h3>
                                {validationStatus.isValid && currentAuth.bienes.length > 1 && (
                                    <button
                                        onClick={() => {
                                            if (selectedItems.length === currentAuth.bienes.length) {
                                                setSelectedItems([]);
                                            } else {
                                                setSelectedItems(currentAuth.bienes.map(b => b.serial));
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-bold bg-[#39A900] text-white rounded-lg hover:bg-[#007832] transition-colors"
                                    >
                                        {selectedItems.length === currentAuth.bienes.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {currentAuth.bienes.map((bien) => (
                                    <div key={bien.serial} className="space-y-2">
                                        <label
                                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedItems.includes(bien.serial)
                                                ? 'border-[#39A900] bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                } ${!validationStatus.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(bien.serial)}
                                                onChange={() => toggleItem(bien.serial)}
                                                disabled={!validationStatus.isValid}
                                                className="h-5 w-5 text-[#39A900] rounded focus:ring-[#39A900]"
                                            />
                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-900 font-bold">Bien</p>
                                                    <p className="font-semibold text-gray-900">{bien.nombre}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-900 font-bold">Marca</p>
                                                    <p className="font-semibold text-gray-900">{bien.marca}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-900 font-bold">Modelo</p>
                                                    <p className="font-semibold text-gray-900">{bien.modelo}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-900 font-bold">Placa</p>
                                                    <p className="font-semibold text-gray-900">{bien.placa}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-900 font-bold">Serial</p>
                                                    <p className="font-semibold text-gray-900">{bien.serial}</p>
                                                </div>
                                            </div>
                                        </label>
                                        
                                        {/* Observación para bienes NO seleccionados */}
                                        {!selectedItems.includes(bien.serial) && validationStatus.isValid && (
                                            <div className="ml-9 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                <label className="block text-xs font-bold text-gray-900 mb-1">
                                                    ¿Por qué no sale este bien? <span className="text-red-600">*</span>
                                                </label>
                                                <textarea
                                                    value={itemObservations[bien.serial] || ''}
                                                    onChange={(e) => setItemObservations(prev => ({
                                                        ...prev,
                                                        [bien.serial]: e.target.value
                                                    }))}
                                                    placeholder="Ej: El solicitante decidió no llevarlo, equipo en mantenimiento, etc."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none resize-none text-sm text-gray-900 placeholder-gray-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Exit Location Selector */}
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Lugar de Salida <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={exitLocation}
                                    onChange={(e) => setExitLocation(e.target.value)}
                                    disabled={!validationStatus.isValid}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none text-gray-900 font-medium ${!validationStatus.isValid ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                >
                                    <option value="">Seleccione el edificio de salida</option>
                                    <option value="CIES">CIES</option>
                                    <option value="CEDRUM">CEDRUM</option>
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleRegisterExit}
                                    disabled={!canRegisterExit}
                                    className={`px-8 py-3 rounded-lg font-bold text-white transition-colors flex items-center gap-2 ${canRegisterExit
                                        ? 'bg-[#39A900] hover:bg-[#007832] cursor-pointer'
                                        : 'bg-gray-300 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    <Clock className="h-5 w-5" />
                                    Registrar Salida
                                </button>
                            </div>

                            {!canRegisterExit && (
                                <p className="mt-2 text-sm text-[#DC2626] font-bold text-right">
                                    {!validationStatus.isValid 
                                        ? 'Botón bloqueado: Faltan autorizaciones requeridas'
                                        : selectedItems.length === 0
                                        ? 'Botón bloqueado: Seleccione al menos un bien'
                                        : exitLocation.trim() === ''
                                        ? 'Botón bloqueado: Seleccione el lugar de salida'
                                        : 'Botón bloqueado: Complete las observaciones de los bienes que no salen'
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* REINGRESO Authorization Details */}
                {currentAuth && activeTab === 'REINGRESO' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-[#00304D] mb-4">
                                Autorización: {currentAuth.id}
                            </h2>
                            
                            {/* Información de la Autorización */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Nombre Solicitante</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.solicitante}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Uso o Motivo</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.uso_motivo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Destino</p>
                                    <p className="text-gray-900 font-semibold text-base">{currentAuth.destino}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Fecha Real de Salida Registrada</p>
                                    {(() => {
                                        const exitLog = actionLog.find(
                                            log => log.tipo === 'SALIDA' && log.autorizacionId === currentAuth.id
                                        );

                                        if (exitLog) {
                                            return (
                                                <div>
                                                    <p className="text-gray-900 font-semibold text-base">
                                                        {exitLog.timestamp.toLocaleDateString('es-CO', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-900 font-semibold mt-0.5">
                                                        Hora: {exitLog.timestamp.toLocaleTimeString('es-CO')}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return <p className="text-gray-900 font-semibold text-base">Pendiente de registro</p>;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-900 font-bold mb-1">Fecha Límite de Regreso</p>
                                    <p className="text-gray-900 font-semibold text-base">
                                        {new Date(currentAuth.fecha_limite_regreso).toLocaleDateString('es-CO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-[#00304D] mb-4">
                                Bienes para Reingreso
                            </h3>
                            <div className="space-y-3 mb-6">
                                {currentAuth.bienes.filter(b => b.estado === "Afuera").map((bien) => (
                                    <div
                                        key={bien.serial}
                                        className="p-4 border-2 border-gray-200 rounded-lg"
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Bien</p>
                                                <p className="font-semibold text-gray-900">{bien.nombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Marca</p>
                                                <p className="font-semibold text-gray-900">{bien.marca}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Modelo</p>
                                                <p className="font-semibold text-gray-900">{bien.modelo}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Placa</p>
                                                <p className="font-semibold text-gray-900">{bien.placa}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Serial</p>
                                                <p className="font-semibold text-gray-900">{bien.serial}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-900 font-bold">Estado</p>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${bien.estado === 'Afuera'
                                                    ? 'bg-yellow-100 text-yellow-900'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}>
                                                    {bien.estado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Observaciones (Opcional)
                                </label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    placeholder="Ej: El equipo ingresó con rayones en la carcasa..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleRegisterReentry}
                                    className="px-8 py-3 bg-[#39A900] text-white rounded-lg font-bold hover:bg-[#007832] transition-colors flex items-center gap-2"
                                >
                                    <LogIn className="h-5 w-5" />
                                    Confirmar Reingreso
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {searchQuery && !currentAuth && !isSearching && activeTab !== 'BITACORA' && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No se encontraron resultados
                        </h3>
                        <p className="text-gray-900 font-medium">
                            Verifica el código de autorización o nombre del solicitante ingresado
                        </p>
                    </div>
                )}
            </main>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-[#00304D] mb-4">
                            Detalles del Registro
                        </h2>

                        {/* Información General */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-900 font-bold mb-1">Tipo de Acción</p>
                                {selectedLog.tipo === 'SALIDA' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900">
                                        <LogOut className="h-3 w-3 mr-1" />
                                        SALIDA
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900">
                                        <LogIn className="h-3 w-3 mr-1" />
                                        REINGRESO
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-900 font-bold mb-1">Código de Autorización</p>
                                <p className="text-gray-900 font-semibold text-base">{selectedLog.autorizacionId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-900 font-bold mb-1">Solicitante</p>
                                <p className="text-gray-900 font-semibold text-base">{selectedLog.solicitante}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-900 font-bold mb-1">Fecha y Hora</p>
                                <p className="text-gray-900 font-semibold text-base">
                                    {selectedLog.timestamp.toLocaleDateString('es-CO', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-gray-900 font-semibold mt-0.5">
                                    Hora: {selectedLog.timestamp.toLocaleTimeString('es-CO')}
                                </p>
                            </div>
                        </div>

                        {/* Bienes que salieron/reingresaron */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-[#00304D] mb-3">
                                Bienes {selectedLog.tipo === 'SALIDA' ? 'que Salieron' : 'que Reingresaron'} ({selectedLog.bienesCount})
                            </h3>
                            <div className="space-y-2">
                                {selectedLog.bienes.map((serial, index) => (
                                    <div key={index} className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                                        <p className="text-sm font-bold text-gray-900">{serial}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bienes que NO salieron */}
                        {selectedLog.bienesNoSalieron && selectedLog.bienesNoSalieron.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[#00304D] mb-3">
                                    Bienes que NO Salieron ({selectedLog.bienesNoSalieron.length})
                                </h3>
                                <div className="space-y-3">
                                    {selectedLog.bienesNoSalieron.map((bien, index) => (
                                        <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                            <p className="text-sm font-bold text-gray-900 mb-1">{bien.nombre}</p>
                                            <p className="text-xs text-gray-900 font-semibold mb-2">Serial: {bien.serial}</p>
                                            <div className="bg-white p-2 rounded border border-yellow-200">
                                                <p className="text-xs font-bold text-gray-900 mb-1">Motivo:</p>
                                                <p className="text-sm text-gray-900">{bien.motivo}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Observaciones generales */}
                        {selectedLog.observaciones && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[#00304D] mb-3">
                                    Observaciones Generales
                                </h3>
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm text-gray-900">{selectedLog.observaciones}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-[#39A900] text-white rounded-lg font-bold hover:bg-[#007832] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl relative">
                            <button
                                onClick={closeSuccessModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Cerrar"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <div className="text-center">
                                <CheckCircle className="h-16 w-16 text-[#39A900] mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-[#00304D] mb-2">
                                    {activeTab === 'SALIDA' ? '¡Salida Registrada!' : '¡Reingreso Registrado!'}
                                </h3>
                                <p className="text-gray-900 font-medium">
                                    {activeTab === 'SALIDA'
                                        ? `${selectedItems.length} bien(es) registrado(s) exitosamente`
                                        : 'El bien ha sido reingresado correctamente'
                                    }
                                </p>
                                <p className="text-sm text-gray-600 font-semibold mt-2">
                                    {new Date().toLocaleString('es-CO', {
                                        dateStyle: 'medium',
                                        timeStyle: 'medium'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
