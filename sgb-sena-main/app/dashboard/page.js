'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  PackageIcon,
  UsersIcon,
  ClipboardIcon
} from '../components/Icons';
import DashboardVigilante from '../components/DashboardVigilante';

// Componentes de dashboard según rol
const DashboardCuentadante = () => {
  const [stats, setStats] = useState({
    bienesACargo: 0,
    bienesDisponibles: 0,
    bienesEnPrestamo: 0,
    solicitudesPendientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.documento) return;

        const response = await fetch(`/api/dashboard/stats?rol=cuentadante&documento=${userData.documento}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Bienes Bajo Mi Cuidado"
        value={loading ? '...' : stats.bienesACargo.toString()}
        color="from-[#39A900] to-[#007832]"
        icon={<PackageIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Bienes Disponibles para Préstamo"
        value={loading ? '...' : stats.bienesDisponibles.toString()}
        color="from-blue-500 to-blue-600"
        icon={<CheckCircleIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Bienes En Préstamo"
        value={loading ? '...' : stats.bienesEnPrestamo.toString()}
        color="from-purple-500 to-purple-600"
        icon={<AlertIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Solicitudes Pendientes"
        value={loading ? '...' : stats.solicitudesPendientes.toString()}
        color="from-orange-500 to-orange-600"
        icon={<ClipboardIcon className="w-10 h-10" />}
      />
    </div>
  );
};

const DashboardAdministrador = () => {
  const [stats, setStats] = useState({
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    totalSolicitudes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats?rol=administrador');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Solicitudes"
        value={loading ? '...' : stats.totalSolicitudes.toString()}
        color="from-[#39A900] to-[#007832]"
        icon={<ClipboardIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Pendientes de Firmar"
        value={loading ? '...' : stats.solicitudesPendientes.toString()}
        color="from-orange-500 to-orange-600"
        icon={<AlertIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Aprobadas"
        value={loading ? '...' : stats.solicitudesAprobadas.toString()}
        color="from-purple-500 to-purple-600"
        icon={<CheckCircleIcon className="w-10 h-10" />}
      />
    </div>
  );
};

const DashboardAlmacenista = ({ router }) => {
  const [stats, setStats] = useState({
    totalBienes: 0,
    bienesSinAsignar: 0,
    cuentadantesActivos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Bienes Registrados"
        value={loading ? '...' : stats.totalBienes.toString()}
        color="from-[#39A900] to-[#007832]"
        icon={<PackageIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Sin Asignar"
        value={loading ? '...' : stats.bienesSinAsignar.toString()}
        color="from-orange-500 to-orange-600"
        icon={<AlertIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Cuentadantes Activos"
        value={loading ? '...' : stats.cuentadantesActivos.toString()}
        color="from-blue-500 to-blue-600"
        icon={<UsersIcon className="w-10 h-10" />}
      />
    </div>
  );
};

const DashboardUsuario = () => {
  const [stats, setStats] = useState({
    solicitudesActivas: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.documento) return;

        const response = await fetch(`/api/dashboard/stats?rol=usuario&documento=${userData.documento}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Solicitudes Activas"
        value={loading ? '...' : stats.solicitudesActivas.toString()}
        color="from-blue-500 to-blue-600"
        icon={<AlertIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Aprobadas"
        value={loading ? '...' : stats.solicitudesAprobadas.toString()}
        color="from-[#007832] to-[#39A900]"
        icon={<CheckCircleIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Rechazadas"
        value={loading ? '...' : stats.solicitudesRechazadas.toString()}
        color="from-red-500 to-red-600"
        icon={<ClipboardIcon className="w-10 h-10" />}
      />
    </div>
  );
};

const DashboardCoordinador = () => {
  const [stats, setStats] = useState({
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats?rol=coordinador');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Pendientes de Firmar"
        value={loading ? '...' : stats.solicitudesPendientes.toString()}
        color="from-orange-500 to-orange-600"
        icon={<AlertIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Aprobadas"
        value={loading ? '...' : stats.solicitudesAprobadas.toString()}
        color="from-[#007832] to-[#39A900]"
        icon={<CheckCircleIcon className="w-10 h-10" />}
      />
      <StatCard
        title="Rechazadas"
        value={loading ? '...' : stats.solicitudesRechazadas.toString()}
        color="from-red-500 to-red-600"
        icon={<ClipboardIcon className="w-10 h-10" />}
      />
    </div>
  );
};

// Componente de tarjeta de estadística con ícono
const StatCard = ({ title, value, color, icon }) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="opacity-80">
        {icon}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Cargar usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39A900]"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.rol) {
      case 'cuentadante':
        return <DashboardCuentadante />;
      case 'administrador':
        return <DashboardAdministrador router={router} />;
      case 'almacenista':
        return <DashboardAlmacenista router={router} />;
      case 'vigilante':
        return <DashboardVigilante user={user} />;
      case 'usuario':
        return <DashboardUsuario />;
      case 'coordinador':
        return <DashboardCoordinador />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Bienvenido, {user.nombre}
        </h2>
        <p className="text-gray-600">Panel de control - {user.rol}</p>
      </div>

      {renderDashboard()}
    </div>
  );
}
