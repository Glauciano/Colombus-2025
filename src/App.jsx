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

        {/* Sidebar - exact Base44 colors */}
        <aside className={`
          fixed lg:relative z-50 h-full transition-all duration-200
          ${collapsed ? 'w-14' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col bg-[#12211c]
        `}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
            <div className="w-7 h-7 rounded bg-[#15803d] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[11px]">C</span>
            </div>
            {!collapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-[#ebe7e0]">Colombus</span>
                <span className="text-[10px] text-[#677e77]">2025</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && !collapsed && (
                  <p className="px-3 mb-1 text-[10px] font-medium text-[#677e77] uppercase tracking-wider">{section.title}</p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px]
                        transition-colors
                        ${isActive
                          ? 'bg-[#ebe7e0] text-[#12211c] font-medium'
                          : 'text-[#ebe7e0]/60 hover:text-[#ebe7e0] hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse */}
          <div className="px-2 py-2 border-t border-[#677e77]/20 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[#677e77] hover:text-[#ebe7e0] w-full"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-[#fbfaf9]">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-12 border-b border-[#e5e7eb] bg-white sticky top-0 z-30">
            <button onClick={() => setMobileOpen(true)} className="p-1.5 -ml-1 rounded hover:bg-[#f6f5f3]">
              <Menu className="w-5 h-5 text-[#677e77]" />
            </button>
            <span className="text-sm font-semibold text-[#12211c]">Colombus 2025</span>
          </div>

          <div className="p-6 lg:p-8 max-w-5xl mx-auto">
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
