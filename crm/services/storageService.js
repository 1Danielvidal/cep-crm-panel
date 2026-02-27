const STORAGE_KEY = 'cep_crm_requests';

// Generar un ID simple
function generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Inicializar la base de datos si está vacía
function initDB() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
}

// Obtener todas las solicitudes
export function getRequests() {
    initDB();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Obtener una solicitud por ID
export function getRequestById(id) {
    const requests = getRequests();
    return requests.find(req => req.id === id) || null;
}

// Crear una nueva solicitud
export function createRequest(requestData) {
    const requests = getRequests();

    // Validar campos requeridos mínimos
    if (!requestData.name || !requestData.contact || !requestData.type) {
        throw new Error("Faltan campos obligatorios");
    }

    const newRequest = {
        id: generateId(),
        ...requestData,
        status: requestData.status || 'Pendiente', // Pendiente, En Progreso, Completado
        priority: requestData.priority || 'Normal', // Alta, Normal, Baja
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    requests.push(newRequest);

    // Guardar (ordenamos por defecto más recientes primero, o lo dejamos así y ordenamos al leer)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return newRequest;
}

// Actualizar una solicitud existente
export function updateRequest(id, updates) {
    const requests = getRequests();
    const index = requests.findIndex(req => req.id === id);

    if (index === -1) {
        throw new Error("Solicitud no encontrada");
    }

    const updatedRequest = {
        ...requests[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    requests[index] = updatedRequest;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

    return updatedRequest;
}

// Eliminar una solicitud
export function deleteRequest(id) {
    const requests = getRequests();
    const filtered = requests.filter(req => req.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

// Poblar con datos de prueba (solo para desarrollo)
export function seedMockData() {
    initDB();
    const current = getRequests();
    if (current.length === 0) {
        const mockData = [
            { id: generateId(), name: "Juan Pérez", contact: "3001234567", type: "Visita Nueva", priority: "Alta", status: "Pendiente", notes: "Llegó referenciado por María.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: generateId(), name: "Familia González", contact: "3109876543", type: "Consejería", priority: "Normal", status: "En Progreso", notes: "Problemas matrimoniales, cita este jueves.", createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
            { id: generateId(), name: "Ana López", contact: "ana@email.com", type: "Bautismo", priority: "Baja", status: "Completado", notes: "Ya realizó el curso.", createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    }
}
