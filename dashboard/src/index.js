import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { FiActivity, FiDatabase, FiMessageCircle, FiSettings } from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import AdminPanel from './pages/AdminPanel';
import { API_PORT_LABEL } from './config';
import './styles.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiActivity },
  { to: '/chat', label: 'Chatbot', icon: FiMessageCircle },
  { to: '/admin', label: 'Database', icon: FiDatabase },
];

const App = () => (
  <BrowserRouter>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <strong>Support Console</strong>
            <span>MuleSoft API Experience</span>
          </div>
        </div>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-link">
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-status">
          <FiSettings aria-hidden="true" />
          <span>{API_PORT_LABEL}</span>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(<App />);
