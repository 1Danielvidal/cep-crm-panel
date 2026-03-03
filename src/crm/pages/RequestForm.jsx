import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';
import { Save, User, Phone, Tag, AlertCircle, FileText, Calendar, Mails, MapPin, Users } from 'lucide-react';
import './RequestForm.css';

function RequestForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
        tipo_persona: 'VISITA', nombres: '', apellidos: '', sexo: 'M',
        telefono_principal: '', email: '', direccion: '', barrio_ciudad: '',
        estado_espiritual: 'PRIMERA_VISITA', invita_por: '',
        tipo_solicitud: 'VISITA_HOGAR', origen: 'FORMULARIO_WEB',
        descripcion_breve: '', prioridad: 'MEDIA',
        fecha_limite_contacto: '', asignado_a_usuario_id: '', notas_confidenciales: ''
    });

    useEffect(() => { api.getUsuarios().then(setUsuarios).catch(console.error); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const personaPayload = { ...formData, fecha_primera_visita: new Date().toISOString().split('T')[0] };
            const nuevaPersona = await api.createPersona(personaPayload);
            const solicitudPayload = {
                persona_id: nuevaPersona.id,
                tipo_solicitud: formData.tipo_solicitud,
                origen: formData.origen,
                descripcion_breve: formData.descripcion_breve,
                prioridad: formData.prioridad,
                estado: 'PENDIENTE',
                fecha_limite_contacto: formData.fecha_limite_contacto || null,
                asignado_a_usuario_id: formData.asignado_a_usuario_id || null,
                notas_confidenciales: formData.notas_confidenciales
            };
            await api.createRequest(solicitudPayload);
            alert("¡Registro guardado con éxito! 🕊️");
            navigate('/solicitudes');
        } catch (error) {
            alert("Error al guardar: Verifica que todos los campos obligatorios (*) estén llenos.");
        } finally { setLoading(false); }
    };

    return (
        <div className="crm-form-page">
            <div className="crm-page-header"><h2>Registrar Atención Pastoral</h2></div>
            <div className="crm-form-container shadow">
                <form onSubmit={handleSubmit} className="crm-form">
                    <h3 className="crm-section-title"><User size={18} /> Datos de la Persona</h3>
                    <div className="crm-form-row">
                        <div className="crm-form-group"><label>Nombres *</label><input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} /></div>
                        <div className="crm-form-group"><label>Apellidos *</label><input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} /></div>
                    </div>
                    <div className="crm-form-row">
                        <div className="crm-form-group"><label><Phone size={16} /> Teléfono Principal *</label><input type="text" name="telefono_principal" required value={formData.telefono_principal} onChange={handleChange} /></div>
                        <div className="crm-form-group">
                            <label>Asignar a:</label>
                            <select name="asignado_a_usuario_id" value={formData.asignado_a_usuario_id} onChange={handleChange}>
                                <option value="">-- Sin asignar --</option>
                                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="crm-form-group full-width">
                        <label>Descripción de la Necesidad *</label>
                        <textarea name="descripcion_breve" rows="2" required value={formData.descripcion_breve} onChange={handleChange}></textarea>
                    </div>
                    <div className="crm-form-actions">
                        <button type="submit" className="crm-btn crm-btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default RequestForm;
