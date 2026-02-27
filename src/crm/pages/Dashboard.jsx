import { useEffect, useState } from 'react';
import { api } from '../services/apiService';
import { Briefcase, CheckCircle, Clock, AlertTriangle, Users, FilePlus } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const dashboardStats = await api.getDashboardStats();
                setStats(dashboardStats);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return <div className="crm-loading-spinner">Cargando métricas...</div>;
    }

    const percentageAtendidas = stats?.total > 0 ? Math.round((stats.atendidas / (stats.total || 1)) * 100) : 0;

    return (
        <div className="crm-dashboard">
            <h2 className="crm-dashboard-title">Panel de Control General</h2>

            <div className="crm-stats-grid advanced">
                {/* 1. Total solicitudes período */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon blue"><Briefcase size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>Total Solicitudes</h3>
                        <p>{stats?.total || 0}</p>
                    </div>
                </div>

                {/* 2. Pendientes Hoy */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon red"><AlertTriangle size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>Pendientes Hoy</h3>
                        <p>{stats?.pendientesHoy || 0}</p>
                    </div>
                </div>

                {/* 3. Pendientes Semana */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon yellow"><Clock size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>Pendientes (Semana)</h3>
                        <p>{stats?.pendientesSemana || 0}</p>
                    </div>
                </div>

                {/* 4. Porcentaje Atendidas */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon green"><CheckCircle size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>Atendidas (%)</h3>
                        <p>{percentageAtendidas}%</p>
                    </div>
                </div>

                {/* 5. Nuevas Visitas */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon purple"><FilePlus size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>Nuevas Visitas</h3>
                        <p>{stats?.nuevasVisitas || 0}</p>
                    </div>
                </div>

                {/* 6. Personas en Discipulado */}
                <div className="crm-stat-card">
                    <div className="crm-stat-icon indigo"><Users size={24} /></div>
                    <div className="crm-stat-content">
                        <h3>En Discipulado</h3>
                        <p>{stats?.enDiscipulado || 0}</p>
                    </div>
                </div>
            </div>

            <div className="crm-dashboard-footer">
                <p className="crm-text-muted">Las estadísticas mostradas pueden variar según el tipo de solicitud. Dirígete a "Reportes" para visualizar por rangos de fecha y crear exportaciones.</p>
            </div>
        </div>
    );
}

export default Dashboard;
