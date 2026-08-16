import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Truck, Building2, Wallet,
  ChevronLeft, ChevronRight, LogOut, Menu, CircleDot, Upload
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Provas from './pages/Provas';
import Custos from './pages/Custos';
import CustosRibeirao from './pages/CustosRibeirao';
import CustosFranca from './pages/CustosFranca';
import CCRibeirao from './pages/CCRibeirao';
import CCFranca from './pages/CCFranca';
import CCLimeira from './pages/CCLimeira';
import VendaAnilhas from './pages/VendaAnilhas';
import ImportarDados from './pages/ImportarDados';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/provas', label: 'Provas', icon: Trophy },
  { path: '/venda-anilhas', label: 'Venda de Anilhas', icon: CircleDot },
  { path: '/custos', label: 'Custos', icon: Truck },
  { path: '/custos-ribeirao', label: 'Custos Ribeirão Preto', icon: Truck },
  { path: '/custos-franca', label: 'Custos Franca', icon: Truck },
  { path: '/cc-ribeirao', label: 'CC Ribeirão Preto', icon: Wallet },
  { path: '/cc-franca', label: 'CC Franca', icon: Wallet },
  { path: '/cc-limeira', label: 'CC Limeira', icon: Wallet },
  { path: '/importar', label: 'Importar Dados', icon: Upload },
];

function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative z-50 h-full transition-all duration-300
            ${collapsed ? 'w-16' : 'w-64'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}
          style={{
            backgroundColor: 'hsl(160 30% 10%)',
            color: 'hsl(40 20% 90%)'
          }}
        >
          {/* Logo area */}
          <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'hsl(160 20% 20%)' }}>
            <img
              src="/logo.png"
              alt="Colombus"
              className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
              style={{ backgroundColor: 'hsl(160 25% 18%)', padding: '2px' }}
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <h1
                  className="text-lg font-bold leading-tight truncate"
                  style={{ color: 'hsl(42 85% 55%)' }}
                >
                  Colombus
                </h1>
                <p className="text-[10px] opacity-60 leading-tight">2025</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'text-white'
                    : 'opacity-70 hover:opacity-100'
                  }
                `}
                style={({ isActive }) => ({
                  backgroundColor: isActive
                    ? 'hsl(160 25% 18%)'
                    : 'transparent',
                  color: isActive ? 'hsl(42 85% 55%)' : undefined,
                  borderLeft: isActive ? '3px solid hsl(42 85% 55%)' : '3px solid transparent',
                })}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Collapse toggle */}
          <div className="px-2 py-3 border-t hidden lg:block" style={{ borderColor: 'hsl(160 20% 20%)' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm opacity-60 hover:opacity-100 w-full transition-opacity"
            >
              {collapsed
                ? <ChevronRight className="w-5 h-5 mx-auto" />
                : <><ChevronLeft className="w-5 h-5" /><span>Recolher</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border sticky top-0 bg-background z-30">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold" style={{ color: 'hsl(160 45% 22%)' }}>Colombus 2025</h1>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/provas" element={<Provas />} />
              <Route path="/venda-anilhas" element={<VendaAnilhas />} />
              <Route path="/custos" element={<Custos />} />
              <Route path="/custos-ribeirao" element={<CustosRibeirao />} />
              <Route path="/custos-franca" element={<CustosFranca />} />
              <Route path="/cc-ribeirao" element={<CCRibeirao />} />
              <Route path="/cc-franca" element={<CCFranca />} />
              <Route path="/cc-limeira" element={<CCLimeira />} />
              <Route path="/importar" element={<ImportarDados />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
