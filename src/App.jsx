import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Truck, Wallet,
  ChevronLeft, ChevronRight, Menu, CircleDot, Settings
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

const navSections = [
  {
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/provas', label: 'Provas', icon: Trophy },
      { path: '/venda-anilhas', label: 'Venda de Anilhas', icon: CircleDot },
    ]
  },
  {
    title: 'Custos',
    items: [
      { path: '/custos', label: 'Geral', icon: Truck },
      { path: '/custos-ribeirao', label: 'Ribeirão Preto', icon: Truck },
      { path: '/custos-franca', label: 'Franca', icon: Truck },
    ]
  },
  {
    title: 'Contas Corrente',
    items: [
      { path: '/cc-ribeirao', label: 'Ribeirão Preto', icon: Wallet },
      { path: '/cc-franca', label: 'Franca', icon: Wallet },
      { path: '/cc-limeira', label: 'Limeira', icon: Wallet },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { path: '/importar', label: 'Configuração', icon: Settings },
    ]
  },
];

function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:relative z-50 h-full transition-all duration-200
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col bg-gray-900 text-gray-300
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-14 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && (
              <div>
                <span className="text-sm font-semibold text-white">Colombus</span>
                <span className="text-[10px] text-gray-500 ml-1">2025</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && !collapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        transition-colors
                        ${isActive
                          ? 'bg-green-600/15 text-green-400 font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon className={`w-[18px] h-[18px] shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse */}
          <div className="px-3 py-3 border-t border-gray-800 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 w-full"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-gray-200 bg-white sticky top-0 z-30">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">Colombus 2025</span>
          </div>

          <div className="p-8 max-w-5xl mx-auto">
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
