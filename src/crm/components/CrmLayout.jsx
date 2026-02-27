import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './CrmLayout.css';

function CrmLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { path: "/", label: "Dashboard", icon: <Home size={20} />, end: true },
        { path: "/solicitudes", label: "Listado de Solicitudes", icon: <Users size={20} /> },
        { path: "/registrar", label: "Registrar Nueva", icon: <PlusCircle size={20} /> },
        { path: "/reportes", label: "Reportes", icon: <BarChart3 size={20} /> }
    ];

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="crm-layout">
            {/* Header móvil */}
            <header className="crm-mobile-header">
                <div className="crm-logo-container">
                    <h2>CEP <span>CRM</span></h2>
                </div>
                <button className="crm-menu-btn" onClick={toggleMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Desktop e Móvil */}
            <aside className={`crm-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="crm-sidebar-header">
                    <h2>CEP <span>CRM</span></h2>
                    <p>Panel Pastoral</p>
                </div>

                <nav className="crm-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.end || false}
                                    className={({ isActive }) => isActive ? "crm-nav-link active" : "crm-nav-link"}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="crm-sidebar-footer">
                    <button className="crm-logout-btn" onClick={() => navigate("/")}>
                        <span>Volver a la Web</span>
                    </button>
                </div>
            </aside>

            {/* Overlay para móvil */}
            {isMobileMenuOpen && (
                <div className="crm-overlay" onClick={toggleMenu}></div>
            )}

            {/* Contenido Principal */}
            <main className="crm-main-content">
                <header className="crm-top-header desktop-only">
                    <div>
                        <h1>¡Bienvenido al Panel Pastoral!</h1>
                        <p>Gestiona eficientemente el cuidado de la congregación.</p>
                    </div>
                </header>
                <div className="crm-content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default CrmLayout;
