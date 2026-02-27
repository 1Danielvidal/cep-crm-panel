import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CrmLayout from './crm/components/CrmLayout';
import Dashboard from './crm/pages/Dashboard';
import RequestList from './crm/pages/RequestList';
import RequestForm from './crm/pages/RequestForm';
import Reports from './crm/pages/Reports';

// CRM Pastoral CEP - Acceso Libre por Simplicidad
function App() {
    return (
        <Router>
            <Routes>
                <Route element={<CrmLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="solicitudes" element={<RequestList />} />
                    <Route path="registrar" element={<RequestForm />} />
                    <Route path="reportes" element={<Reports />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
