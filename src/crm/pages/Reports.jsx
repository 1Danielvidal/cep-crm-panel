import { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { Calendar, Filter, PieChart, BarChart2, Activity, Download, Users, Briefcase, FileSpreadsheet } from 'lucide-react';
import { downloadCSV } from '../utils/exportCsv';
import { downloadExcel } from '../utils/excelUtils';
import './Reports.css';

function Reports() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [ministerios, setMinisterios] = useState([]);
    const [ministerioId, setMinisterioId] = useState('');

    useEffect(() => {
        api.getMinisterios().then(setMinisterios).catch(console.error);
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            let query = '?';
            if (fechaInicio) query += `fechaInicio=${fechaInicio}&`;
            if (fechaFin) query += `fechaFin=${fechaFin}&`;
            if (ministerioId) query += `ministerioId=${ministerioId}`;

            const data = await api.getReportes(query);
            setReportData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadReports();
    };

    const handleExportExcel = async () => {
        setExportLoading(true);
        try {
            const data = await api.getReporteCompleto();
            const fileName = `CRM_CEP_Exportación_${new Date().toISOString().split('T')[0]}`;

            const mappingHeaders = {
                fecha_creacion: 'Fecha Registro', tipo_persona: 'Tipo de Persona', nombres: 'Nombres', apellidos: 'Apellidos',
                sexo: 'Sexo', fecha_nacimiento: 'Fecha Nacimiento', telefono_principal: 'Teléfono Principal', telefono_secundario: 'Teléfono Secundario',
                email: 'Email', direccion: 'Dirección', barrio_ciudad: 'Barrio/Ciudad', estado_espiritual: 'Estado Espiritual',
                invita_por: 'Invitado Por', fecha_primera_visita: 'Fecha 1ra Visita', notas_persona: 'Notas Generales Persona',
                tipo_solicitud: 'Tipo Solicitud', origen: 'Origen del Registro', descripcion_solicitud: 'Petición / Descripción Detallada',
                prioridad: 'Prioridad', estado: 'Estado de la Solicitud', fecha_limite_contacto: 'Fecha Límite Contacto',
                fecha_cierre: 'Fecha de Cierre', asignado_a: 'Persona Asignada', ministerio_responsable: 'Ministerio Responsable',
                notas_seguimiento: 'Notas de Seguimiento (Servidor)'
            };

            const dataMapped = data.map(row => {
                let mapped = {};
                Object.keys(mappingHeaders).forEach(key => {
                    let val = row[key];
                    if (val && key.includes('fecha')) {
                        try { val = new Date(val).toLocaleDateString(); } catch (e) { }
                    }
                    mapped[mappingHeaders[key]] = val || '';
                });
                return mapped;
            });

            downloadExcel(dataMapped, fileName);
        } catch (error) {
            alert("No se pudo generar el Excel");
        } finally {
            setExportLoading(false);
        }
    };

    if (loading && !reportData) {
        return <div className="crm-loading-spinner">Generando Reportes Avanzados...</div>;
    }

    return (
        <div className="crm-reports-page">
            <div className="crm-page-header">
                <h2>Cifras y Reportes Pastorales</h2>
                <div className="crm-header-actions">
                    <button className="crm-btn crm-btn-primary" onClick={handleExportExcel} disabled={exportLoading} title="Exportar base de datos completa a Excel">
                        <FileSpreadsheet size={18} /> {exportLoading ? 'Exportando...' : 'Exportar Sábana de Datos Completos'}
                    </button>
                </div>
            </div>

            <form className="crm-reports-filters shadow" onSubmit={handleFilter}>
                <div className="crm-filter-group">
                    <label><Calendar size={16} /> Desde:</label>
                    <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                </div>
                <div className="crm-filter-group">
                    <label><Calendar size={16} /> Hasta:</label>
                    <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                <div className="crm-filter-group">
                    <label><Filter size={16} /> Ministerio:</label>
                    <select value={ministerioId} onChange={e => setMinisterioId(e.target.value)}>
                        <option value="">Todos los Ministerios</option>
                        {ministerios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                </div>
                <button type="submit" className="crm-btn crm-btn-primary">Aplicar Filtros</button>
            </form>

            {loading && <div className="crm-loading-overlay">Actualizando...</div>}

            {reportData && (
                <div className="crm-reports-grid">

                    {/* CUADRO 1: Cumplimiento */}
                    <div className="crm-report-card shadow full-width">
                        <h3 className="crm-section-title"><Activity size={18} /> Cumplimiento de Seguimiento (SLA)</h3>
                        <div className="crm-compliance-box">
                            <div className="crm-compliance-stat">
                                <span className="label">Total Asignadas</span>
                                <span className="value">{reportData.cumplimiento.total_asignadas}</span>
                            </div>
                            <div className="crm-compliance-stat">
                                <span className="label">Atendidas</span>
                                <span className="value">{reportData.cumplimiento.total_atendidas}</span>
                            </div>
                            <div className="crm-compliance-stat">
                                <span className="label">A Tiempo</span>
                                <span className="value success">{reportData.cumplimiento.atendidas_a_tiempo}</span>
                            </div>
                            <div className="crm-compliance-stat main">
                                <span className="label">Cumplimiento</span>
                                <span className={`value ${reportData.cumplimiento.porcentaje_cumplimiento >= 80 ? 'success' : 'danger'}`}>
                                    {reportData.cumplimiento.porcentaje_cumplimiento}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CUADRO 2: Gráfico Tipos */}
                    <div className="crm-report-card shadow min-h">
                        <h3 className="crm-section-title"><PieChart size={18} /> Por Tipo de Solicitud</h3>
                        <div className="crm-simple-bar-chart">
                            {reportData.distribucionTipo.map(item => {
                                const max = Math.max(...reportData.distribucionTipo.map(d => parseInt(d.valor)));
                                const percentage = (parseInt(item.valor) / max) * 100;
                                return (
                                    <div key={item.nombre} className="crm-bar-container">
                                        <div className="crm-bar-label">{item.nombre.replace(/_/g, ' ')} ({item.valor})</div>
                                        <div className="crm-bar-track">
                                            <div className="crm-bar-fill blue" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {reportData.distribucionTipo.length === 0 && <p className="crm-text-muted">No hay datos</p>}
                        </div>
                    </div>

                    {/* CUADRO 3: Gráfico Estados (Pipeline) */}
                    <div className="crm-report-card shadow min-h">
                        <h3 className="crm-section-title"><BarChart2 size={18} /> Estado Actual de Solicitudes</h3>
                        <div className="crm-simple-bar-chart">
                            {reportData.distribucionEstado.map(item => {
                                const max = Math.max(...reportData.distribucionEstado.map(d => parseInt(d.valor)));
                                const percentage = (parseInt(item.valor) / max) * 100;
                                return (
                                    <div key={item.nombre} className="crm-bar-container">
                                        <div className="crm-bar-label">{item.nombre.replace(/_/g, ' ')} ({item.valor})</div>
                                        <div className="crm-bar-track">
                                            <div className="crm-bar-fill purple" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {reportData.distribucionEstado.length === 0 && <p className="crm-text-muted">No hay datos</p>}
                        </div>
                    </div>

                    {/* CUADRO 4: Gráfico Estado Espiritual */}
                    <div className="crm-report-card shadow full-width">
                        <h3 className="crm-section-title"><Users size={18} /> Demografía por Estado Espiritual</h3>
                        <div className="crm-simple-bar-chart flex-row-chart">
                            {reportData.distribucionEspiritual.map(item => {
                                const total = reportData.distribucionEspiritual.reduce((acc, curr) => acc + parseInt(curr.valor), 0);
                                const percentage = (parseInt(item.valor) / total) * 100;
                                return (
                                    <div key={item.nombre} className="crm-col-bar-container">
                                        <div className="crm-col-bar-track">
                                            <div className="crm-col-bar-fill indigo" style={{ height: `${percentage}%` }}>
                                                <span className="crm-col-val">{item.valor}</span>
                                            </div>
                                        </div>
                                        <div className="crm-col-bar-label">{item.nombre.replace(/_/g, ' ')}</div>
                                    </div>
                                );
                            })}
                            {reportData.distribucionEspiritual.length === 0 && <p className="crm-text-muted">No hay datos</p>}
                        </div>
                    </div>

                    {/* CUADRO 5: Carga por Usuario/Ministerio */}
                    <div className="crm-report-card shadow full-width">
                        <h3 className="crm-section-title"><Briefcase size={18} /> Carga Laboral por Usuario/Ministerio</h3>
                        {reportData.cargaPorUsuario.length > 0 ? (
                            <>
                                <div className="crm-simple-bar-chart" style={{ marginBottom: '20px' }}>
                                    {reportData.cargaPorUsuario.map(row => {
                                        const max = Math.max(...reportData.cargaPorUsuario.map(d => parseInt(d.total_asignadas)));
                                        const percentage = max > 0 ? (parseInt(row.total_asignadas) / max) * 100 : 0;
                                        return (
                                            <div key={`${row.usuario}-${row.ministerio}`} className="crm-bar-container">
                                                <div className="crm-bar-label">{row.usuario} ({row.ministerio || 'Sin Especificar'}) - {row.total_asignadas} Asignadas</div>
                                                <div className="crm-bar-track">
                                                    <div className="crm-bar-fill blue" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <table className="crm-table compact">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Ministerio</th>
                                            <th>Total Asignadas</th>
                                            <th>Pendientes</th>
                                            <th>Atendidas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.cargaPorUsuario.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="crm-fw-medium">{row.usuario}</td>
                                                <td>{row.ministerio || 'Sin Especificar'}</td>
                                                <td>{row.total_asignadas}</td>
                                                <td className={parseInt(row.pendientes) > 0 ? 'crm-text-danger' : ''}>{row.pendientes}</td>
                                                <td className="crm-text-success">{row.atendidas}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <p className="crm-text-muted">No hay asignaciones en este cruce de datos.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
