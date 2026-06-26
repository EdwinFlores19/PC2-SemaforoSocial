import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import CandidateView from './components/CandidateView';
import EmployerView from './components/EmployerView';
import WorkerDashboard from './components/WorkerDashboard';
import ClientMap from './components/ClientMap';
import FintechView from './components/FintechView';
import OnboardingView from './components/OnboardingView';
import { MetricCard, RoleCard, Button, Card, Badge } from './components/SemaforoComponents.js';
import SemiChatbot, { ChatbotRole } from './components/SemiChatbot';

// Real SVG icons for high-contrast metrics
const UsersIcon = (
  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShieldIcon = (
  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CapIcon = (
  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const POSIcon = (
  <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

// Real SVG icons for access roles
const WorkerRoleIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11M5 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 005 11zm11 10c0-3.517-1.009-6.799-2.753-9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0013 11m4 0c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054.09A13.916 13.916 0 0017 11z" />
  </svg>
);

const CustomerRoleIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EnterpriseRoleIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function App(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulación rápida de logout para mantener la consistencia
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Navbar link classes conforming to design system (uppercase, 13px font size equivalent to text-[13px])
  const getLinkClass = (path: string, activeColor: string) => {
    return `flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wider transition-all duration-150 ${
      isActive(path)
        ? `bg-[#1A202C] text-[#F7FAFC] border border-[#2D3748] ${activeColor}`
        : 'text-[#A0AEC0] hover:text-[#F7FAFC] hover:bg-[#1A202C]/30'
    }`;
  };

  // Detectar el rol del usuario logueado en caliente para Ruti
  let detectedRole: ChatbotRole = 'cliente'; // Por defecto es conductor/cliente (invitado)
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'CANDIDATE' || parsed.role === 'WORKER') {
        detectedRole = 'trabajador';
      } else if (parsed.role === 'EMPLOYER') {
        detectedRole = 'employer';
      } else if (parsed.role === 'ADMIN') {
        detectedRole = 'fiscalizador';
      }
    }
  } catch (err) {
    console.warn('Error al parsear el rol del usuario para Ruti:', err);
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F7FAFC] flex flex-col font-sans antialiased relative">
      {/* 1. MANDATORY Navbar COMPONENT (Reconstructed with 24px/gap-6 Spacing) */}
      <header className="bg-[#1A202C] border-b border-[#2D3748] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-[#3B82F6] hover:bg-[#2563EB] p-2.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all">
                <span className="text-xl">🚦</span>
              </div>
              <span className="text-2xl font-black text-[#F7FAFC] tracking-tight">
                En<span className="text-[#3B82F6]">Ruta</span>
                <span className="sr-only">PC2-PFDC3</span>
              </span>
            </Link>
            
            {/* Center navigation with EXACT gap-6 (24px spacing between items) */}
            <nav className="hidden xl:flex items-center gap-6">
              <Link to="/dashboard" className={getLinkClass('/dashboard', 'border-[#3B82F6]/40 text-[#3B82F6]')}>
                🏠 Dashboard
              </Link>
              <Link to="/candidate" className={getLinkClass('/candidate', 'border-emerald-500/40 text-emerald-400')}>
                🧹 Coach CV
              </Link>
              <Link to="/employer" className={getLinkClass('/employer', 'border-indigo-500/40 text-indigo-400')}>
                💼 Buscar RAG
              </Link>
              <Link to="/chambea-ahora" className={getLinkClass('/chambea-ahora', 'border-[#48BB78]/40 text-[#48BB78] border-l border-[#2D3748] pl-6')}>
                💚 Chambea Ahora!
              </Link>
              <Link to="/buscar" className={getLinkClass('/buscar', 'border-[#F6AD55]/40 text-[#F6AD55]')}>
                📍 Mapa Vial
              </Link>
              <Link to="/payments" className={getLinkClass('/payments', 'border-cyan-500/40 text-cyan-400')}>
                📶 POS & Pagos
              </Link>
              <Link to="/onboarding" className={getLinkClass('/onboarding', 'border-purple-500/40 text-purple-400')}>
                🛡️ KYC Registro
              </Link>
            </nav>
          </div>

          {/* Action buttons with minimum 44px height */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="min-h-[44px] text-[13px] font-semibold uppercase tracking-wider text-[#A0AEC0] hover:text-[#F7FAFC] px-4 rounded-xl transition-all"
              >
                Ingresar
              </button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 min-h-[44px]"
              >
                Salir
              </Button>
            </div>

            {/* HAMBURGER MENU BUTTON COLLAPSIBLE FOR MOBILE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex items-center justify-center p-2 rounded-xl text-[#A0AEC0] hover:text-[#F7FAFC] hover:bg-[#171923] focus:outline-none min-h-[44px] min-w-[44px]"
              aria-label="Abrir menú"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE DROPDOWN MENU FOR MOBILE */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0F1117] border-t border-[#2D3748] px-6 py-5 space-y-2.5 flex flex-col shadow-2xl animate-fadeIn">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/dashboard', 'border-[#3B82F6]/40 text-[#3B82F6]')}>
              🏠 Dashboard
            </Link>
            <Link to="/candidate" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/candidate', 'border-emerald-500/40 text-emerald-400')}>
              🧹 Coach CV
            </Link>
            <Link to="/employer" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/employer', 'border-indigo-500/40 text-indigo-400')}>
              💼 Buscar RAG
            </Link>
            <Link to="/chambea-ahora" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/chambea-ahora', 'border-[#48BB78]/40 text-[#48BB78]')}>
              💚 Chambea Ahora!
            </Link>
            <Link to="/buscar" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/buscar', 'border-[#F6AD55]/40 text-[#F6AD55]')}>
              📍 Mapa Vial
            </Link>
            <Link to="/payments" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/payments', 'border-cyan-500/40 text-cyan-400')}>
              📶 POS & Pagos
            </Link>
            <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)} className={getLinkClass('/onboarding', 'border-purple-500/40 text-purple-400')}>
              🛡️ KYC Registro
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-[#2D3748]/50">
              <Button
                variant="secondary"
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full h-11"
              >
                Ingresar
              </Button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="bg-[#E53E3E]/10 text-[#E53E3E] hover:bg-[#E53E3E]/20 border border-[#E53E3E]/20 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all h-11"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginPlaceholder />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/candidate" element={<CandidateView />} />
          <Route path="/employer" element={<EmployerView />} />
          <Route path="/chambea-ahora" element={<WorkerDashboard />} />
          <Route path="/buscar" element={<ClientMap />} />
          <Route path="/payments" element={<FintechView />} />
          <Route path="/onboarding" element={<OnboardingView />} />
        </Routes>
      </main>

      {/* FOOTER GLOBAL - Jerarquía tipográfica real, sin copy duplicado */}
      <footer className="bg-[#171923] border-t border-[#2D3748] py-8 text-center text-sm text-[#A0AEC0]">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p className="font-extrabold text-[#F7FAFC] text-base tracking-wider uppercase font-mono">
            🚦 EnRuta — Transformación Social Vial con IA & Fintech
          </p>
          <p className="text-xs text-[#A0AEC0] max-w-xl mx-auto leading-relaxed">
            Plataforma digital para la formalización laboral y bancarización de asistentes independientes en Perú. Respaldado y fiscalizado bajo las normativas de MINTRA y MIMP contra la erradicación del trabajo infantil.
          </p>
          <div className="pt-4 border-t border-[#2D3748]/50 text-[11px] text-[#A0AEC0]/40 font-mono flex flex-col sm:flex-row justify-between items-center gap-2 max-w-3xl mx-auto">
            <span>&copy; {new Date().getFullYear()} — PC2 Boilerplate Full-Stack. Ecosistema SRE.</span>
            <span>Versión de Producto 1.0 (DS Maestro)</span>
          </div>
        </div>
      </footer>

      {/* BURBUJA FLOTANTE GLOBAL DE LA MASCOTA RUTI */}
      <SemiChatbot role={detectedRole} isFloating={true} />
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTES VISTA INTERNOS (REDDISEÑADOS)
// ─────────────────────────────────────────────

function HomeView(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* HERO SECTION */}
      <div className="text-center space-y-6 relative py-4">
        {/* Route glowing effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#3B82F6]/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Real Badge using DS standards */}
        <div className="inline-block transform hover:scale-105 transition-all">
          <Badge status="VERDE" text="🚀 TECNOLOGÍA CON IMPACTO SOCIAL REAL" />
        </div>

        <h1 className="text-[48px] font-extrabold text-[#F7FAFC] tracking-tight leading-none">
          Plataforma <span className="text-[#3B82F6]">EnRuta</span>
        </h1>
        
        {/* Markdown Asterisks Bug Solved: rendering with strong JSX tags instead of unparsed markdown */}
        <p className="text-[16px] text-[#A0AEC0] max-w-3xl mx-auto leading-[1.6]">
          Un sistema inteligente on-demand de micro-empleo y fintech enfocado en la <strong>formalización, capacitación y salud financiera</strong> de trabajadores independientes en Perú, con control estricto contra el trabajo infantil.
        </p>

        <div className="flex justify-center gap-6 pt-4">
          <Button
            onClick={() => navigate('/chambea-ahora')}
            className="font-bold min-h-[44px]"
          >
            💼 ¡Chambea Ahora!
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/buscar')}
            className="min-h-[44px]"
          >
            📍 Buscar Servicios
          </Button>
        </div>
      </div>

      {/* 3. MANDATORY MetricCard GRID (No HTML Table, Real SVG Vector Icons) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          icon={UsersIcon}
          value="350+"
          label="Trabajadores Activos"
        />
        <MetricCard
          icon={ShieldIcon}
          value="0%"
          label="Trabajo Infantil"
          className="border-emerald-500/10 shadow-[0_0_10px_rgba(72,187,120,0.05)]"
        />
        <MetricCard
          icon={CapIcon}
          value="4,200+"
          label="Cursos Completados"
        />
        <MetricCard
          icon={POSIcon}
          value="S/. 12.5K"
          label="Procesado POS"
        />
      </div>

      {/* 4. MANDATORY RoleCard GRID with Real SVG Vector Icons and CTA Arrow Ghosts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          icon={WorkerRoleIcon}
          title="Soy Trabajador Vial"
          description="Accede a tu panel 'Chambea Ahora!', sube tu semáforo de formalización con cursos y obtén micro-créditos."
          onClick={() => navigate('/chambea-ahora')}
          ctaText="Ir a Chambea Ahora"
        />
        <RoleCard
          icon={CustomerRoleIcon}
          title="Necesito Asistencia"
          description="Encuentra asistentes viales de confianza geolocalizados en semáforos cerca de ti y califícalos con estrellas."
          onClick={() => navigate('/buscar')}
          ctaText="Buscar Trabajadores"
        />
        <RoleCard
          icon={EnterpriseRoleIcon}
          title="POS Virtual & Fintech"
          description="Gestiona cobros sin contacto mediante NFC Tap-to-Pay y códigos QR Yape/Plin con split automático de comisiones."
          onClick={() => navigate('/payments')}
          ctaText="Abrir POS & Billetera"
        />
      </div>
    </div>
  );
}

function LoginPlaceholder(): React.JSX.Element {
  return (
    <div className="max-w-md mx-auto my-8">
      <Card className="relative overflow-hidden bg-[#171923] border border-[#2D3748]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-[24px] font-semibold text-[#F7FAFC] text-center mb-2 tracking-tight">Iniciar Sesión</h2>
        <p className="text-[13px] text-[#A0AEC0] text-center mb-6 leading-[1.6]">Accede a la ruta de formalización de EnRuta</p>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[13px] font-mono font-bold text-[#A0AEC0] uppercase tracking-[0.05em] mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full bg-[#0F1117] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-[#F7FAFC] placeholder-slate-600 focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all"
              defaultValue="admin@test.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-mono font-bold text-[#A0AEC0] uppercase tracking-[0.05em] mb-1.5">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#0F1117] border border-[#2D3748] rounded-xl px-4 py-3 text-sm text-[#F7FAFC] placeholder-slate-600 focus:ring-2 focus:ring-[#3B82F6] outline-none transition-all"
              defaultValue="Admin123!"
            />
          </div>
          <Button
            type="submit"
            className="w-full min-h-[44px] mt-6"
          >
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
}

function DashboardPlaceholder(): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-[#2D3748] pb-6">
        <span className="text-[#3B82F6] uppercase text-[13px] tracking-[0.05em] font-mono font-bold block mb-1">
          📊 MÉTRICAS GENERALES DE PLATAFORMA
        </span>
        <h1 className="text-[36px] font-bold text-[#F7FAFC] tracking-tight">Panel de Control (Dashboard)</h1>
        <p className="text-[16px] text-[#A0AEC0] mt-1">Inspección de operatividad y estadísticas fiscales en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <span className="text-[13px] font-mono font-bold text-[#A0AEC0] uppercase tracking-[0.05em]">Estatus del Backend</span>
          <span className="mt-2 text-[24px] font-bold text-[#48BB78]">🟢 Activo</span>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-[13px] font-mono font-bold text-[#A0AEC0] uppercase tracking-[0.05em]">Conexión Supabase</span>
          <span className="mt-2 text-[24px] font-bold text-[#3B82F6]">🟢 Conectado</span>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-[13px] font-mono font-bold text-[#A0AEC0] uppercase tracking-[0.05em]">Monitoreo SRE</span>
          <span className="mt-2 text-[24px] font-bold text-[#F7FAFC]">100% Saludable</span>
        </Card>
      </div>

      <Card className="space-y-4">
        <h3 className="text-[20px] font-bold text-[#F7FAFC] border-b border-[#2D3748] pb-3">
          📋 Datos de Control y Fiscalización
        </h3>
        <p className="text-[16px] text-[#A0AEC0] leading-[1.6]">
          Este módulo está diseñado para la fiscalización del cumplimiento de regulaciones viales de superación de trabajadores independientes en Perú.
        </p>
        <div className="bg-[#F6AD55]/10 border border-[#F6AD55]/20 rounded-xl p-4 text-[13px] text-[#F6AD55] font-mono leading-relaxed">
          <strong>Tip de Administración:</strong> Usa el generador dinámico `npx tsx scripts/mvc_crud_boilerplate_generator.ts &lt;Entidad&gt;` para automatizar nuevas tablas y pegarlas directamente aquí.
        </div>
      </Card>
    </div>
  );
}
