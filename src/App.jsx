import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Truck, Wallet, Users,
  ChevronLeft, Menu, CircleDot, Settings, ChevronRight, MapPin, LogOut
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Provas from './pages/Provas';
import Custos from './pages/Custos';
import CustosBase from './pages/CustosBase';
import CCBase from './pages/CCBase';
import CCLimeira from './pages/CCLimeira';
import VendaAnilhas from './pages/VendaAnilhas';
import ImportarDados from './pages/ImportarDados';
import CidadesConfig from './pages/CidadesConfig';
import Login from './pages/Login';
import { db, ENTITIES } from './lib/db';
import { supabase } from './lib/supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cmoaiyhwmrsaihibfhux.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AUHiIr1CvseO8Uy-XtqFyw_L3ELN2-4';

// City name to slug
function cityToSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Known city → entity mapping
const CITY_ENTITY_MAP = {
  'ribeirao-preto=': { custo: ENTITIES.CUSTO_RIBEIRAO, cc: ENTITIES.RECEIVEIS_RIBEIRAO },
  'franca-s-p': { custo: ENTITIES.CUSTO_FRANCA, cc: ENTITIES.RECEIVEIS_FRANCA },
  'limeira': { custo: null, cc: ENTITIES.SOCIO_LIMEIRA },
};

function getCityEntity(slug) {
  // Check known mappings first
  const known = {
    'ribeirao-preto': { custo: ENTITIES.CUSTO_RIBEIRAO, cc: ENTITIES.RECEIVEIS_RIBEIRAO },
    'franca-s-p': { custo: ENTITIES.CUSTO_FRANCA, cc: ENTITIES.RECEIVEIS_FRANCA },
    'limeira': { custo: null, cc: ENTITIES.SOCIO_LIMEIRA },
  };
  if (known[slug]) return known[slug];
  // For new cities, use custo_logistico for costs and create a dynamic entity
  return { custo: ENTITIES.CUSTO_LOGISTICO, cc: null, isNew: true };
}

function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cidades, setCidades] = React.useState(['Ribeirão Preto', 'Franca S.P', 'Limeira']);
  const [user, setUser] = React.useState(null);

  // Auth is disabled for now — login page exists at /login but is not active
  // To re-enable: uncomment the login check below AND set up Supabase Auth
  const handleLogin = (u) => setUser(u);
  const handleLogout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
  };

  // Login is optional — app works without it
  // To enable login, uncomment the block below:
  // if (!user) {
  //   return <Login onLogin={handleLogin} />;
  // }

  // Load cidades from Supabase on mount
  React.useEffect(() => {
    const loadCidades = async () => {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/configuracao?select=valor_texto&chave=eq.cidades_ativas`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const data = await resp.json();
        if (data && data.length > 0 && data[0].valor_texto) {
          setCidades(data[0].valor_texto.split(',').filter(Boolean));
        }
      } catch (err) {
        console.error('Error loading cidades:', err);
      }
    };
    loadCidades();
  }, []);

  // Build dynamic nav sections
  const navSections = React.useMemo(() => {
    const custosItems = [];
    const ccItems = [];

    cidades.forEach(nome => {
      const slug = cityToSlug(nome);
      if (slug === 'limeira') {
        ccItems.push({ path: '/cc-limeira', label: `C/C ${nome}`, icon: Wallet });
      } else {
        custosItems.push({ path: `/custos-${slug}`, label: nome, icon: Truck });
        ccItems.push({ path: `/cc-${slug}`, label: `C/C ${nome}`, icon: Wallet });
      }
    });

    return [
      {
        items: [
          { path: '/', label: 'Painel', icon: LayoutDashboard },
          { path: '/provas', label: 'Provas', icon: Trophy },
          { path: '/venda-anilhas', label: 'Venda de Anilhas', icon: CircleDot },
        ]
      },
      ...(custosItems.length > 0 ? [{ title: 'Custos', items: [{ path: '/custos', label: 'Custos', icon: Truck }, ...custosItems] }] : []),
      ...(ccItems.length > 0 ? [{ title: 'Contas Corrente', items: ccItems }] : []),
      {
        items: [
          { path: '/cidades', label: 'Cidades', icon: MapPin },
          { path: '/importar', label: 'Configuração', icon: Settings },
        ]
      },
    ];
  }, [cidades]);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:relative z-50 h-full transition-all duration-200 flex flex-col
          bg-sidebar-background text-sidebar-foreground
          ${collapsed ? 'w-[60px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
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

          {/* Collapse toggle + Logout */}
          <div className="px-3 py-3 border-t border-sidebar-border space-y-1 hidden lg:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 mx-auto" />
                : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>
              }
            </button>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
              >
                <LogOut className="w-4 h-4" /><span>Sair</span>
              </button>
            )}
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
              <Route path="/cidades" element={<CidadesConfig />} />
              <Route path="/importar" element={<ImportarDados />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />

              {/* Dynamic city routes */}
              <Route path="/custos-ribeirao-preto" element={<CustosBase entity={ENTITIES.CUSTO_RIBEIRAO} title="Custos Ribeirão Preto" subtitle="Gastos logísticos - Ribeirão Preto" pdfName="custos-ribeirao-preto.pdf" />} />
              <Route path="/custos-franca-s-p" element={<CustosBase entity={ENTITIES.CUSTO_FRANCA} title="Custos Franca" subtitle="Gastos logísticos - Franca" pdfName="custos-franca.pdf" />} />
              <Route path="/cc-ribeirao-preto" element={<CCBase entity={ENTITIES.RECEIVEIS_RIBEIRAO} queryKey="recebiveis-ribeirao" title="Conta Corrente Ribeirão Preto" subtitle="Receíveis - Ribeirão Preto" pdfName="cc-ribeirao-preto.pdf" />} />
              <Route path="/cc-franca-s-p" element={<CCBase entity={ENTITIES.RECEIVEIS_FRANCA} queryKey="recebiveis-franca" title="Conta Corrente Franca" subtitle="Receíveis - Franca" pdfName="cc-franca.pdf" />} />
              <Route path="/cc-limeira" element={<CCLimeira />} />

              {/* Dynamic routes for new cities */}
              {cidades.filter(c => {
                const slug = cityToSlug(c);
                return slug !== 'ribeirao-preto' && slug !== 'franca-s-p' && slug !== 'limeira';
              }).map(nome => {
                const slug = cityToSlug(nome);
                return (
                  <React.Fragment key={slug}>
                    <Route path={`/custos-${slug}`} element={<CustosBase entity={ENTITIES.CUSTO_LOGISTICO} title={`Custos ${nome}`} subtitle={`Gastos logísticos - ${nome}`} pdfName={`custos-${slug}.pdf`} />} />
                    <Route path={`/cc-${slug}`} element={<CCBase entity={ENTITIES.RECEIVEIS_RIBEIRAO} queryKey={`cc-${slug}`} title={`Conta Corrente ${nome}`} subtitle={`Receíveis - ${nome}`} pdfName={`cc-${slug}.pdf`} />} />
                  </React.Fragment>
                );
              })}

              {/* Legacy routes (backward compat) */}
              <Route path="/custos-ribeirao" element={<CustosBase entity={ENTITIES.CUSTO_RIBEIRAO} title="Custos Ribeirão Preto" subtitle="Gastos logísticos - Ribeirão Preto" pdfName="custos-ribeirao-preto.pdf" />} />
              <Route path="/custos-franca" element={<CustosBase entity={ENTITIES.CUSTO_FRANCA} title="Custos Franca" subtitle="Gastos logísticos - Franca" pdfName="custos-franca.pdf" />} />
              <Route path="/cc-ribeirao" element={<CCBase entity={ENTITIES.RECEIVEIS_RIBEIRAO} queryKey="recebiveis-ribeirao" title="Conta Corrente Ribeirão Preto" subtitle="Receíveis - Ribeirão Preto" pdfName="cc-ribeirao-preto.pdf" />} />
              <Route path="/cc-franca" element={<CCBase entity={ENTITIES.RECEIVEIS_FRANCA} queryKey="recebiveis-franca" title="Conta Corrente Franca" subtitle="Receíveis - Franca" pdfName="cc-franca.pdf" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
