import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Truck, Wallet,
  ChevronLeft, ChevronRight, Menu, CircleDot, Upload, Settings
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
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out
            ${collapsed ? 'w-[68px]' : 'w-[260px]'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col border-r border-white/5
          `}
          style={{
            background: 'linear-gradient(180deg, hsl(160 35% 12%) 0%, hsl(160 40% 8%) 100%)',
            color: 'hsl(40 20% 90%)'
          }}
        >
          {/* Logo area */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(42 85% 55%) 0%, hsl(42 70% 45%) 100%)' }}
            >
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden animate-slide-in">
                <h1
                  className="text-lg font-bold leading-tight truncate"
                  style={{ color: 'hsl(42 85% 55%)', fontFamily: 'var(--font-display)' }}
                >
                  Colombus
                </h1>
                <p className="text-[10px] opacity-50 leading-tight font-medium tracking-wider uppercase">Campanha 2025</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && !collapsed && (
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40">
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
                        flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium
                        transition-all duration-200 group
                        ${isActive
                          ? ''
                          : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                        }
                      `}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? 'hsl(42 85% 55%)' : 'transparent',
                        color: isActive ? 'hsl(160 40% 8%)' : undefined,
                        boxShadow: isActive ? '0 2px 8px hsl(42 85% 55% / 30%)' : 'none',
                      })}
                    >
                      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} strokeWidth={2.2} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse toggle */}
          <div className="px-2.5 py-3 border-t border-white/10 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] opacity-50 hover:opacity-100 hover:bg-white/5 w-full transition-all duration-200"
            >
              {collapsed
                ? <ChevronRight className="w-5 h-5 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'hsl(160 15% 97%)' }}>
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border sticky top-0 bg-card/80 backdrop-blur-md z-30">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(42 85% 55%) 0%, hsl(42 70% 45%) 100%)' }}
              >
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <h1 className="font-bold text-sm" style={{ color: 'hsl(160 45% 22%)', fontFamily: 'var(--font-display)' }}>Colombus 2025</h1>
            </div>
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
