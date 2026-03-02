/* COPIA ESTE CÓDIGO PARA EL PANEL */
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

    useEffect(() => { loadReports(); api.getMinisterios().then(setMinisterios); }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            let q = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&ministerioId=${ministerioId}`;
            const data = await api.getReportes(q);
            setReportData(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleExportExcel = async () => {
        setExportLoading(true);
        try {
            const data = await api.getReporteCompleto();
            const mapping = {
                fecha_creacion: 'Fecha Registro', tipo_persona: 'Tipo Persona', nombres: 'Nombres', apellidos: 'Apellidos',
                sexo: 'Sexo', fecha_nacimiento: 'Fecha Nacimiento', telefono_principal: 'Teléfono Principal',
                telefono_secundario: 'Teléfono Secundario', email: 'Email', direccion: 'Dirección', barrio_ciudad: 'Barrio/Ciudad',
                estado_espiritual: 'Estado Espiritual', invita_por: 'Invitado Por', fecha_primera_visita: '1ra Visita',
                notas_persona: 'Notas Persona', tipo_solicitud: 'Tipo Solicitud', origen: 'Origen Registro',
                descripcion_solicitud: 'Petición Detallada', prioridad: 'Prioridad', estado: 'Estado Solicitud',
                fecha_limite: 'Límite Contacto', fecha_cierre: 'Fecha Cierre', asignado_a: 'Asignado A',
                ministerio: 'Ministerio', notas_seguimiento: 'Notas Seguimiento'
            };
            const mapped = data.map(r => {
                let m = {};
                Object.keys(mapping).forEach(k => { m[mapping[k]] = (k.includes('fecha') && r[k]) ? new Date(r[k]).toLocaleDateString() : (r[k] || ''); });
                return m;
            });
            downloadExcel(mapped, `CRM_CEP_Sábana_Datos_${new Date().toISOString().split('T')[0]}`);
        } catch (e) { alert("Error al exportar"); } finally { setExportLoading(false); }
    };

    return (
        <div className="crm-reports-page">
            <div className="crm-page-header">
                <h2>Reportes Pastorales</h2>
                <div className="crm-header-actions">
                    <button className="crm-btn crm-btn-primary" onClick={handleExportExcel} disabled={exportLoading}>
                        <FileSpreadsheet size={16} /> {exportLoading ? 'Generando Sábana...' : 'Exportar Sábana de Datos (Excel)'}
                    </button>
                    <button className="crm-btn crm-btn-outline" onClick={() => downloadCSV(reportData.cargaPorUsuario, 'Carga.csv')}>
                        <Download size={16} /> Resumen Carga (CSV)
                    </button>
                </div>
            </div>
            {/* ... Resto del componente de filtros y gráficos ... */}
            <form className="crm-reports-filters shadow" onSubmit={(e) => { e.preventDefault(); loadReports(); }}>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                <select value={ministerioId} onChange={e => setMinisterioId(e.target.value)}>
                    <option value="">Todos los Ministerios</option>
                    {ministerios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <button type="submit" className="crm-btn crm-btn-primary">Filtrar</button>
            </form>
            {reportData && (
                <div className="crm-reports-grid">
                    <div className="crm-report-card shadow full-width">
                        <h3><Activity size={18} /> Resumen de Cumplimiento</h3>
                        <div className="crm-compliance-box">
                            <div className="crm-compliance-stat"><span>{reportData.cumplimiento.total_asignadas}</span><label>Asignadas</label></div>
                            <div className="crm-compliance-stat"><span>{reportData.cumplimiento.total_atendidas}</span><label>Atendidas</label></div>
                            <div className="crm-compliance-stat main"><span>{reportData.cumplimiento.porcentaje_cumplimiento}%</span><label>Efectividad</label></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;
