import { Routes, Route } from 'react-router-dom';
import CrmLayout from './components/CrmLayout';
import Dashboard from './pages/Dashboard';
import RequestList from './pages/RequestList';
import RequestForm from './pages/RequestForm';
import Reports from './pages/Reports';

function CrmApp() {
    return (
        <Routes>
            <Route element={<CrmLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/solicitudes" element={<RequestList />} />
                <Route path="/registrar" element={<RequestForm />} />
                <Route path="/reportes" element={<Reports />} />
            </Route>
        </Routes>
    );
}

export default CrmApp;
