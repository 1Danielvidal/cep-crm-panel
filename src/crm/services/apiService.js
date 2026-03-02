const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchApi = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error en la petición');
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const api = {
    // Personas
    async getPersonas() {
        return fetchApi('/personas');
    },
    async createPersona(data) {
        return fetchApi('/personas', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Solicitudes
    async getRequests() {
        return fetchApi('/solicitudes');
    },
    async createRequest(data) {
        return fetchApi('/solicitudes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async updateRequest(id, data) {
        return fetchApi(`/solicitudes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    async deleteRequest(id) {
        return fetchApi(`/solicitudes/${id}`, {
            method: 'DELETE',
        });
    },

    // Usuarios y Ministerios
    async getUsuarios() {
        return fetchApi('/usuarios');
    },
    async getMinisterios() {
        return fetchApi('/ministerios');
    },

    // Reportes
    async getReportes(query = '') {
        return fetchApi(`/reportes${query}`);
    },
    async getReporteCompleto() {
        return fetchApi('/reportes/completo');
    }
};
