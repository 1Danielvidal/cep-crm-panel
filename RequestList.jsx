import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import './RequestList.css';

function RequestList() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getRequests();
            setRequests(data);
            setFilteredRequests(data);
        } catch (error) {
            console.error("Error al cargar solicitudes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = requests;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(r =>
                (r.nombres && r.nombres.toLowerCase().includes(term)) ||
                (r.apellidos && r.apellidos.toLowerCase().includes(term)) ||
                (r.descripcion_breve && r.descripcion_breve.toLowerCase().includes(term))
            );
        }

        if (filterStatus) {
            result = result.filter(r => r.estado === filterStatus);
        }

        if (filterType) {
            result = result.filter(r => r.tipo_solicitud === filterType);
        }

        setFilteredRequests(result);
    }, [searchTerm, filterStatus, filterType, requests]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.updateRequest(id, { estado: newStatus, fecha_cierre: newStatus === 'ATENDIDA' || newStatus === 'CERRADA_NO_PROCEDE' ? new Date().toISOString() : null });
            loadData();
        } catch (error) {
            alert("No se pudo actualizar el estado");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.")) {
            try {
                await api.deleteRequest(id);
                loadData();
            } catch (error) {
                alert("Error al eliminar la solicitud");
            }
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'ALTA': return <span className="crm-badge high">Alta</span>;
            case 'MEDIA': return <span className="crm-badge medium">Media</span>;
            case 'BAJA': return <span className="crm-badge low">Baja</span>;
            default: return null;
        }
    };

    return (
        <div className="crm-list-page">
            <div className="crm-page-header">
                <h2>Listado de Solicitudes Pastorales</h2>
                <button className="crm-btn crm-btn-primary" onClick={() => window.location.href = '/crm/registrar'}>
                    Nueva Solicitud
                </button>
            </div>

            <div className="crm-filters-bar">
                <div className="crm-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Todos los Estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="ATENDIDA">Atendida</option>
                        <option value="CERRADA_NO_PROCEDE">Cerrada (No Procede)</option>
                    </select>

                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Todos los Tipos</option>
                        <option value="ORACION">Oración</option>
                        <option value="ESTUDIO_BIBLICO">Estudio Bíblico</option>
                        <option value="CONSEJERIA">Consejería</option>
                        <option value="BAUTISMO">Bautismo</option>
                        <option value="VISITA_HOGAR">Visita a Hogar</option>
                        <option value="OTRO">Otro</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="crm-loading-spinner">Cargando datos...</div>
            ) : filteredRequests.length === 0 ? (
                <div className="crm-empty-state">No se encontraron solicitudes.</div>
            ) : (
                <div className="crm-table-container shadow">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Persona</th>
                                <th>Solicitud</th>
                                <th>Prioridad / Fechas</th>
                                <th>Asignado A</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id}>
                                    <td className="crm-fw-medium">
                                        <div className="crm-name-col">{req.nombres} {req.apellidos}</div>
                                        <div className="crm-contact-sub">Origen: {req.origen.replace(/_/g, ' ')}</div>
                                    </td>
                                    <td>
                                        <div className="crm-type-col">{req.tipo_solicitud.replace(/_/g, ' ')}</div>
                                        <div className="crm-notes-preview" title={req.descripcion_breve}>
                                            {req.descripcion_breve?.substring(0, 40)}{req.descripcion_breve?.length > 40 ? '...' : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <div>{getPriorityBadge(req.priority)}</div>
                                        <div className="crm-date-col mt-1">Límite: {req.fecha_limite_contacto ? new Date(req.fecha_limite_contacto).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div className="crm-type-col">{req.asignado_a_nombre || 'Sin asignar'}</div>
                                        <div className="crm-contact-sub">{req.ministerio_nombre || ''}</div>
                                    </td>
                                    <td>
                                        <select
                                            className={`crm-status-select ${req.estado.toLowerCase().replace(/_/g, '-')}`}
                                            value={req.estado}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                        >
                                            <option value="PENDIENTE">Pendiente</option>
                                            <option value="EN_PROCESO">En Proceso</option>
                                            <option value="ATENDIDA">Atendida</option>
                                            <option value="CERRADA_NO_PROCEDE">Cerrada</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="crm-btn-icon crm-text-danger"
                                            onClick={() => handleDelete(req.id)}
                                            title="Eliminar Solicitud"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RequestList;
