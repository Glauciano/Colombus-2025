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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar - exact Base44 colors */}
        <aside className={`
          fixed lg:relative z-50 h-full transition-all duration-200
          ${collapsed ? 'w-[68px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col bg-[#12211c]
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 shrink-0 border-b border-[#2e4f3f]">
            <div className="w-9 h-9 rounded-lg bg-[#e5a51b] flex items-center justify-center shrink-0">
              <span className="text-[#12211c] font-bold text-base">C</span>
            </div>
            {!collapsed && (
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold text-[#e8e2d7] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Colombus</span>
                <span className="text-xs text-[#6b8a7e] font-medium">2025</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && !collapsed && (
                  <p className="px-3 mb-2.5 text-[11px] font-semibold text-[#6b8a7e] uppercase tracking-[0.08em]">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150
                        ${isActive
                          ? 'bg-[#233f32] text-[#e8e2d7] font-semibold'
                          : 'text-[#e8e2d7]/60 hover:text-[#e8e2d7] hover:bg-[#233f32]/50'
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

          {/* Collapse toggle */}
          <div className="px-4 py-3 border-t border-[#2e4f3f] hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#6b8a7e] hover:text-[#e8e2d7] hover:bg-[#233f32]/50 w-full transition-colors"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher menu</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#faf8f3]">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-5 h-14 border-b border-[#e5ddd1] bg-white sticky top-0 z-30 shadow-sm">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[#f0ede7] transition-colors">
              <Menu className="w-5 h-5 text-[#6b8a7e]" />
            </button>
            <span className="text-sm font-semibold text-[#12211c]">Colombus 2025</span>
          </div>

          <div className="p-8 lg:p-10">
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
