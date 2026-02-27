// CRM Pastoral CEP - API Service
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5501/api';

// Configura fetch para que lance error si no es ok
async function fetchApi(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    if (res.status === 204) return true;
    return await res.json();
}

export const api = {
    // ---- PERSONA ----
    async getPersonas() {
        return fetchApi('/personas');
    },
    async getPersonaById(id) {
        return fetchApi(`/personas/${id}`);
    },
    async createPersona(data) {
        return fetchApi('/personas', { method: 'POST', body: JSON.stringify(data) });
    },
    async updatePersona(id, data) {
        return fetchApi(`/personas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    // ---- SOLICITUDES ----
    async getRequests() {
        return fetchApi('/solicitudes');
    },
    async getRequestById(id) {
        return fetchApi(`/solicitudes/${id}`);
    },
    async createRequest(data) {
        return fetchApi('/solicitudes', { method: 'POST', body: JSON.stringify(data) });
    },
    async updateRequest(id, data) {
        return fetchApi(`/solicitudes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },

    // ---- SEGUIMIENTOS ----
    async getSeguimientos(solicitudId) {
        return fetchApi(`/seguimientos/solicitud/${solicitudId}`);
    },
    async createSeguimiento(data) {
        return fetchApi('/seguimientos', { method: 'POST', body: JSON.stringify(data) });
    },

    // ---- USUARIOS/MINISTERIOS ----
    async getUsuarios() {
        return fetchApi('/usuarios');
    },
    async getMinisterios() {
        return fetchApi('/ministerios');
    },

    // ---- Lógicas de Negocio ----
    async getDashboardStats() {
        return fetchApi('/stats/dashboard');
    },
    async getReportes(query = '') {
        return fetchApi(`/reportes${query}`);
    }
};
