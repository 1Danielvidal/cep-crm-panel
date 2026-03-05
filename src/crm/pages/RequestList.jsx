import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';
import { Search, Filter, Trash2, Eye, X, Phone, Mail, MapPin, User, Calendar, Tag, FileText } from 'lucide-react';
import './RequestList.css';

function RequestList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    const [expandedRowId, setExpandedRowId] = useState(null);

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
            await api.updateRequest(id, {
                estado: newStatus,
                fecha_cierre: newStatus === 'ATENDIDA' || newStatus === 'CERRADA_NO_PROCEDE' ? new Date().toISOString() : null
            });
            loadData();
            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest(prev => ({ ...prev, estado: newStatus }));
            }
        } catch (error) {
            alert("No se pudo actualizar el estado");
        }
    };

    const handleReassign = async (id, newAssignee) => {
        try {
            await api.updateRequest(id, {
                asignado_a_usuario_id: newAssignee
            });
            loadData();
            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest(prev => ({ ...prev, asignado_a_usuario_id: newAssignee }));
            }
        } catch (error) {
            alert("No se pudo reasignar");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.")) {
            try {
                await api.deleteRequest(id);
                loadData();
                if (selectedRequest && selectedRequest.id === id) setSelectedRequest(null);
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

    const getAsignadoNombre = (req) => {
        if (req.asignado_a_nombre) return req.asignado_a_nombre;
        if (req.notas_confidenciales?.includes('[ASIGNADO A:')) {
            return req.notas_confidenciales.split('[ASIGNADO A: ')[1].split(']')[0];
        }
        if (req.asignado_a_usuario_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.asignado_a_usuario_id)) {
            return req.asignado_a_usuario_id;
        }
        return 'Sin asignar';
    };

    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    return (
        <div className="crm-list-page">
            <div className="crm-page-header">
                <h2>Listado de Solicitudes Pastorales</h2>
                <button className="crm-btn crm-btn-primary" onClick={() => navigate('/registrar')}>
                    + Nueva Solicitud
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <React.Fragment key={req.id}>
                                    <tr
                                        className={`crm-clickable-row ${expandedRowId === req.id ? 'expanded' : ''}`}
                                        onClick={() => toggleRow(req.id)}
                                    >
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
                                            <div>{getPriorityBadge(req.prioridad)}</div>
                                            <div className="crm-date-col mt-1">Límite: {req.fecha_limite_contacto ? new Date(req.fecha_limite_contacto).toLocaleDateString() : 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div className="crm-type-col">{getAsignadoNombre(req)}</div>
                                            <div className="crm-contact-sub">{req.ministerio_nombre || ''}</div>
                                        </td>
                                        <td>
                                            <div className="crm-actions-cell">
                                                <button
                                                    className="crm-icon-btn delete"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 size={18} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedRowId === req.id && (
                                        <tr className="crm-expanded-row">
                                            <td colSpan="5">
                                                <div className="crm-expanded-content">
                                                    <div className="crm-detail-grid">
                                                        <div className="crm-detail-section">
                                                            <h4 className="crm-detail-title"><User size={16} /> Datos de la Persona</h4>
                                                            <div className="crm-detail-info">
                                                                <p><strong><Phone size={14} /> Teléfono:</strong> {req.telefono_principal || 'No registrado'}</p>
                                                                <p><strong><Mail size={14} /> Email:</strong> {req.email || 'No registrado'}</p>
                                                                <p><strong><MapPin size={14} /> Dirección:</strong> {req.direccion} {req.barrio_ciudad ? `- ${req.barrio_ciudad}` : ''}</p>
                                                                <p><strong>Estado Espiritual:</strong> {req.estado_espiritual?.replace(/_/g, ' ')}</p>
                                                            </div>
                                                        </div>

                                                        <div className="crm-detail-section">
                                                            <h4 className="crm-detail-title"><Tag size={16} /> Necesidad / Solicitud</h4>
                                                            <div className="crm-detail-info">
                                                                <p><strong>Fecha Registro:</strong> {new Date(req.fecha_creacion).toLocaleString()}</p>
                                                                <p><strong>Descripción:</strong> {req.descripcion_breve}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="my-3 crm-divider" />

                                                    <div className="crm-detail-actions-row">
                                                        <div className="crm-form-group">
                                                            <label><strong><User size={16} /> Re-asignar a:</strong></label>
                                                            <select
                                                                className="crm-select-small"
                                                                value={req.asignado_a_usuario_id || getAsignadoNombre(req)}
                                                                onChange={(e) => handleReassign(req.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="">-- Sin asignar --</option>
                                                                <option value="Pastor Daniel Vidal">Pastor Daniel Vidal</option>
                                                                <option value="Ministro Mauro Cervantes">Ministro Mauro Cervantes</option>
                                                                <option value="Lider Discipulador">Líder Discipulador</option>
                                                                <option value="Secretaria CEP">Secretaria CEP</option>
                                                                <option value="Ministerio de Evangelismo">Ministerio de Evangelismo</option>
                                                                <option value="Anciano">Anciano</option>
                                                            </select>
                                                        </div>

                                                        <div className="crm-form-group">
                                                            <label><strong>Estado Actual:</strong></label>
                                                            <select
                                                                className={`crm-status-select ${req.estado.toLowerCase().replace(/_/g, '-')}`}
                                                                value={req.estado}
                                                                onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="PENDIENTE">Pendiente</option>
                                                                <option value="EN_PROCESO">En Proceso</option>
                                                                <option value="ATENDIDA">Atendida</option>
                                                                <option value="CERRADA_NO_PROCEDE">Cerrada</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {req.notas_confidenciales && (
                                                        <div className="crm-detail-full-text mt-3">
                                                            <label><strong>Notas Confidenciales:</strong></label>
                                                            <div className="crm-notes-box mt-1">
                                                                {req.notas_confidenciales}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RequestList;
