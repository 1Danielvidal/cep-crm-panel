import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';
import { Save, User, Phone, Tag, AlertCircle, FileText, Calendar, Mails, MapPin, Users } from 'lucide-react';
import './RequestForm.css';

function RequestForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

    // Estado Combinado (se dividirá antes de enviar)
    const [formData, setFormData] = useState({
        // Persona
        tipo_persona: 'VISITA',
        nombres: '',
        apellidos: '',
        sexo: 'M',
        telefono_principal: '',
        email: '',
        direccion: '',
        barrio_ciudad: '',
        estado_espiritual: 'PRIMERA_VISITA',
        invita_por: '',

        // Solicitud
        tipo_solicitud: 'VISITA_HOGAR',
        origen: 'FORMULARIO_WEB',
        descripcion_breve: '',
        prioridad: 'MEDIA',
        fecha_limite_contacto: '',
        asignado_a_usuario_id: '',
        notas_confidenciales: ''
    });

    useEffect(() => {
        api.getUsuarios().then(setUsuarios).catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Crear Persona
            const personaPayload = {
                tipo_persona: formData.tipo_persona,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                sexo: formData.sexo,
                telefono_principal: formData.telefono_principal,
                email: formData.email,
                direccion: formData.direccion,
                barrio_ciudad: formData.barrio_ciudad,
                estado_espiritual: formData.estado_espiritual,
                invita_por: formData.invita_por,
                fecha_primera_visita: new Date().toISOString().split('T')[0]
            };
            const nuevaPersona = await api.createPersona(personaPayload);

            // 2. Crear Solicitud asociada
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

            alert("Solicitud guardada con éxito.");
            navigate('/solicitudes');
        } catch (error) {
            console.error('Error al guardar:', error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crm-form-page">
            <div className="crm-page-header">
                <h2>Registrar Nueva Atención / Visita</h2>
                <p className="crm-text-muted">Crea un registro de persona y asocia su necesidad o solicitud.</p>
            </div>

            <div className="crm-form-container shadow">
                <form onSubmit={handleSubmit} className="crm-form">

                    <h3 className="crm-section-title"><User size={18} /> Datos de la Persona</h3>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label>Nombres *</label>
                            <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} />
                        </div>
                        <div className="crm-form-group">
                            <label>Apellidos *</label>
                            <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} />
                        </div>
                        <div className="crm-form-group">
                            <label>Sexo</label>
                            <select name="sexo" value={formData.sexo} onChange={handleChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label><Phone size={16} /> Teléfono Principal *</label>
                            <input type="text" name="telefono_principal" required value={formData.telefono_principal} onChange={handleChange} />
                        </div>
                        <div className="crm-form-group">
                            <label><Mails size={16} /> Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label><MapPin size={16} /> Dirección</label>
                            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                        <div className="crm-form-group">
                            <label>Barrio / Ciudad</label>
                            <input type="text" name="barrio_ciudad" value={formData.barrio_ciudad} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label><Users size={16} /> Estado Espiritual *</label>
                            <select name="estado_espiritual" value={formData.estado_espiritual} onChange={handleChange} required>
                                <option value="PRIMERA_VISITA">Primera Visita</option>
                                <option value="ASISTE_REGULAR">Asiste Regularmente</option>
                                <option value="EN_DISCIPULADO">En Discipulado</option>
                                <option value="MIEMBRO_BAUTIZADO">Miembro Bautizado</option>
                                <option value="EN_RIESGO">En Riesgo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                        <div className="crm-form-group">
                            <label>Tipo de Persona</label>
                            <select name="tipo_persona" value={formData.tipo_persona} onChange={handleChange}>
                                <option value="VISITA">Visita</option>
                                <option value="MIEMBRO">Miembro</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                    </div>


                    <hr className="crm-divider" />
                    <h3 className="crm-section-title"><Tag size={18} /> Detalles de la Solicitud / Seguimiento</h3>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label>Tipo de Solicitud *</label>
                            <select name="tipo_solicitud" value={formData.tipo_solicitud} onChange={handleChange} required>
                                <option value="ORACION">Oración</option>
                                <option value="ESTUDIO_BIBLICO">Estudio Bíblico</option>
                                <option value="CONSEJERIA">Consejería</option>
                                <option value="BAUTISMO">Bautismo</option>
                                <option value="VISITA_HOGAR">Visita a Hogar</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        <div className="crm-form-group">
                            <label>Origen</label>
                            <select name="origen" value={formData.origen} onChange={handleChange}>
                                <option value="FORMULARIO_WEB">Formulario Web</option>
                                <option value="TARJETA_FISICA">Tarjeta Física</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="LLAMADA">Llamada</option>
                                <option value="REFERIDO_POR_LIDER">Referido por Líder</option>
                            </select>
                        </div>
                    </div>

                    <div className="crm-form-row">
                        <div className="crm-form-group">
                            <label><AlertCircle size={16} /> Prioridad *</label>
                            <select name="prioridad" value={formData.prioridad} onChange={handleChange} required>
                                <option value="ALTA">Alta (Urgente)</option>
                                <option value="MEDIA">Media</option>
                                <option value="BAJA">Baja</option>
                            </select>
                        </div>
                        <div className="crm-form-group">
                            <label><Calendar size={16} /> Fecha Límite de Contacto</label>
                            <input type="datetime-local" name="fecha_limite_contacto" value={formData.fecha_limite_contacto} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="crm-form-row">
                        <div className="crm-form-group full-width">
                            <label>Asignar Seguimiento a:</label>
                            <select name="asignado_a_usuario_id" value={formData.asignado_a_usuario_id} onChange={handleChange}>
                                <option value="">-- Sin asignar --</option>
                                <option value="Pastor Daniel Vidal">Pastor Daniel Vidal</option>
                                <option value="Ministro Mauro Cervantes">Ministro Mauro Cervantes</option>
                                <option value="Lider Discipulador">Líder Discipulador</option>
                                <option value="Secretaria CEP">Secretaria CEP</option>
                                <option value="Ministerio de Evangelismo">Ministerio de Evangelismo</option>
                                <option value="Anciano">Anciano</option>
                            </select>
                        </div>
                    </div>

                    <div className="crm-form-group full-width">
                        <label><FileText size={16} /> Descripción de la Necesidad / Resumen</label>
                        <textarea
                            name="descripcion_breve"
                            rows="2"
                            required
                            value={formData.descripcion_breve}
                            onChange={handleChange}
                            placeholder="Motivo de la solicitud, necesidad de oración, etc..."
                        ></textarea>
                    </div>

                    <div className="crm-form-group full-width">
                        <label>Notas Confidenciales</label>
                        <textarea
                            name="notas_confidenciales"
                            rows="2"
                            value={formData.notas_confidenciales}
                            onChange={handleChange}
                            placeholder="Información sensible solo visible para liderazgo pastoral."
                        ></textarea>
                    </div>

                    <div className="crm-form-actions">
                        <button type="button" className="crm-btn crm-btn-outline" onClick={() => navigate('/solicitudes')}>
                            Cancelar
                        </button>
                        <button type="submit" className="crm-btn crm-btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Persona y Solicitud</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default RequestForm;
