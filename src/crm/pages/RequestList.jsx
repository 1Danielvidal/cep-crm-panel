/* ... (puedes copiar el contenido de RequestList.jsx que preparé antes para ti) ... */
import { useState, useEffect } from 'react';
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
                                                className="crm-icon-btn view" 
                                                title="Ver detalle completo"
                                                onClick={() => setSelectedRequest(req)}
                                            >
                                                <Eye size={18} color="#3b82f6" />
                                            </button>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE DETALLES */}
            {selectedRequest && (
                <div className="crm-modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="crm-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="crm-modal-header">
                            <h3><FileText size={20} /> Detalle de la Solicitud</h3>
                            <button className="crm-modal-close" onClick={() => setSelectedRequest(null)}><X size={24} /></button>
                        </div>
                        
                        <div className="crm-modal-body">
                            <div className="crm-detail-grid">
                                {/* Sección Persona */}
                                <div className="crm-detail-section">
                                    <h4 className="crm-detail-title"><User size={16} /> Datos de la Persona</h4>
                                    <div className="crm-detail-info">
                                        <p><strong>Nombre:</strong> {selectedRequest.nombres} {selectedRequest.apellidos}</p>
                                        <p><strong><Phone size={14} /> Teléfono:</strong> {selectedRequest.telefono_principal || 'No registrado'}</p>
                                        <p><strong><Mail size={14} /> Email:</strong> {selectedRequest.email || 'No registrado'}</p>
                                        <p><strong><MapPin size={14} /> Dirección:</strong> {selectedRequest.direccion} {selectedRequest.barrio_ciudad ? `- ${selectedRequest.barrio_ciudad}` : ''}</p>
                                        <p><strong>Estado Espiritual:</strong> {selectedRequest.estado_espiritual?.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>

                                {/* Sección Solicitud */}
                                <div className="crm-detail-section">
                                    <h4 className="crm-detail-title"><Tag size={16} /> Necesidad / Solicitud</h4>
                                    <div className="crm-detail-info">
                                        <p><strong>Tipo:</strong> {selectedRequest.tipo_solicitud?.replace(/_/g, ' ')}</p>
                                        <p><strong>Prioridad:</strong> {getPriorityBadge(selectedRequest.prioridad)}</p>
                                        <p><strong>Fecha Registro:</strong> {new Date(selectedRequest.fecha_creacion).toLocaleString()}</p>
                                        <p><strong>Fecha Límite:</strong> {selectedRequest.fecha_limite_contacto ? new Date(selectedRequest.fecha_limite_contacto).toLocaleDateString() : 'Por definir'}</p>
                                    </div>
                                    <div className="crm-detail-full-text mt-3">
                                        <strong>Descripción de la Necesidad:</strong>
                                        <p className="mt-1">{selectedRequest.descripcion_breve}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Sección Asignación y Estado */}
                            <div className="crm-detail-actions-row">
                                <div className="crm-form-group">
                                    <label><strong><User size={16} /> Re-asignar a:</strong></label>
                                    <select 
                                        className="crm-select-small"
                                        value={selectedRequest.asignado_a_usuario_id || getAsignadoNombre(selectedRequest)}
                                        onChange={(e) => handleReassign(selectedRequest.id, e.target.value)}
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
                                        className={`crm-status-select ${selectedRequest.estado.toLowerCase().replace(/_/g, '-')}`}
                                        value={selectedRequest.estado}
                                        onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                                    >
                                        <option value="PENDIENTE">Pendiente</option>
                                        <option value="EN_PROCESO">En Proceso</option>
                                        <option value="ATENDIDA">Atendida</option>
                                        <option value="CERRADA_NO_PROCEDE">Cerrada</option>
                                    </select>
                                </div>
                            </div>

                            {selectedRequest.notas_confidenciales && (
                                <div className="crm-detail-full-text mt-4">
                                    <label><strong>Notas Adicionales / Confidenciales:</strong></label>
                                    <div className="crm-notes-box mt-1">
                                        {selectedRequest.notas_confidenciales}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="crm-modal-footer">
                            <button className="crm-btn crm-btn-secondary" onClick={() => setSelectedRequest(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RequestList;
