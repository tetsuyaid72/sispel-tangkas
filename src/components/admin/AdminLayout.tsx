import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    ClipboardList,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/requests', icon: ClipboardList, label: 'Pengajuan' },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile header */}
            <header className="admin-mobile-header">
                <button
                    className="menu-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1>{title}</h1>
            </header>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">🏛️</span>
                        <span className="logo-text">Desa Tangkas</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive || location.pathname === item.path ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'Admin'}</span>
                            <span className="user-role">{user?.role || 'Administrator'}</span>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="admin-main">
                <div className="main-header">
                    <h1>{title}</h1>
                </div>
                <div className="main-content">
                    {children}
                </div>
            </main>

            <style>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #f1f5f9;
                }
                
                .admin-sidebar {
                    width: 260px;
                    background: linear-gradient(180deg, #1e3a5f 0%, #0f2744 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                    transition: transform 0.3s ease;
                }
                
                .sidebar-header {
                    padding: 24px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .logo-icon {
                    font-size: 28px;
                }
                
                .logo-text {
                    font-size: 18px;
                    font-weight: 700;
                }
                
                .sidebar-nav {
                    flex: 1;
                    padding: 16px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .nav-item.active {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                }
                
                .sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .user-details {
                    display: flex;
                    flex-direction: column;
                }
                
                .user-name {
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .user-role {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .logout-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #fca5a5;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .logout-button:hover {
                    background: rgba(239, 68, 68, 0.3);
                    color: white;
                }
                
                .admin-main {
                    flex: 1;
                    margin-left: 260px;
                    display: flex;
                    flex-direction: column;
                }
                
                .main-header {
                    display: none;
                    background: white;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                
                .main-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e3a5f;
                    margin: 0;
                }
                
                .main-content {
                    flex: 1;
                    padding: 24px;
                }
                
                .admin-mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: white;
                    z-index: 99;
                    padding: 0 16px;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .admin-mobile-header h1 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e3a5f;
                    margin: 0;
                }
                
                .menu-toggle {
                    background: none;
                    border: none;
                    color: #374151;
                    cursor: pointer;
                    padding: 8px;
                    margin: -8px;
                }
                
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 99;
                }
                
                @media (max-width: 1024px) {
                    .admin-sidebar {
                        transform: translateX(-100%);
                    }
                    
                    .admin-sidebar.open {
                        transform: translateX(0);
                    }
                    
                    .admin-main {
                        margin-left: 0;
                        padding-top: 60px;
                    }
                    
                    .main-header {
                        display: none;
                    }
                    
                    .admin-mobile-header {
                        display: flex;
                    }
                    
                    .sidebar-overlay {
                        display: block;
                    }
                    
                    .main-content {
                        padding: 12px;
                    }
                }
                
                @media (min-width: 1025px) {
                    .main-header {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
}
