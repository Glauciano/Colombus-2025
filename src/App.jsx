import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Truck, Wallet, Users,
  ChevronLeft, Menu, CircleDot, Settings, ChevronRight
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

/* Exact Base44 sidebar structure */
const navSections = [
  {
    items: [
      { path: '/', label: 'Painel', icon: LayoutDashboard },
      { path: '/provas', label: 'Provas', icon: Trophy },
      { path: '/venda-anilhas', label: 'Venda de Anilhas', icon: CircleDot },
    ]
  },
  {
    title: 'Custos',
    items: [
      { path: '/custos', label: 'Custos', icon: Truck },
      { path: '/custos-ribeirao', label: 'Ribeirão Preto', icon: Truck },
      { path: '/custos-franca', label: 'Franca S.P', icon: Truck },
    ]
  },
  {
    title: 'Contas Corrente',
    items: [
      { path: '/cc-ribeirao', label: 'C/C Ribeirão', icon: Wallet },
      { path: '/cc-franca', label: 'C/C Franca', icon: Wallet },
      { path: '/cc-limeira', label: 'C/C Limeira', icon: Wallet },
    ]
  },
  {
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

        {/* Sidebar - exact Base44 shadcn Sidebar structure */}
        <aside className={`
          fixed lg:relative z-50 h-full transition-all duration-200 flex flex-col
          bg-sidebar-background text-sidebar-foreground
          ${collapsed ? 'w-[60px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo header */}
          <div className="flex items-center gap-3 px-5 h-16 shrink-0 border-b border-sidebar-border">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-sm">C</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                Colombus
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {navSections.map((section, si) => (
              <div key={si}>
                {section.title && !collapsed && (
                  <p className="px-3 mb-1 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5 mt-2">
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                        ${isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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

          {/* Collapse toggle */}
          <div className="px-3 py-3 border-t border-sidebar-border hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>
              }
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="lg:hidden flex items-center gap-3 px-5 h-14 border-b border-border bg-card sticky top-0 z-30">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-muted">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-semibold">Colombus 2025</span>
          </div>

          <div className="p-6 lg:p-8">
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
