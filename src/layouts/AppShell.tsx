import { useState } from 'react';
import { Archive, ArrowRight, BookOpen, Boxes, ChevronLeft, CircleHelp, FileStack, FileText, Flame, Home, LockKeyhole, Menu, Scissors, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { ReactNode } from 'react';

export type PageId = 'inicio' | 'dividir' | 'extraer' | 'unir' | 'organizar' | 'herramientas' | 'acerca';
const nav: { id: PageId; label: string; icon: typeof Home; soon?: boolean }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'dividir', label: 'Dividir PDF', icon: Scissors },
  { id: 'extraer', label: 'Extraer páginas', icon: FileText },
  { id: 'unir', label: 'Unir PDF', icon: FileStack, soon: true },
  { id: 'organizar', label: 'Organizar páginas', icon: Boxes, soon: true },
  { id: 'herramientas', label: 'Herramientas PDF', icon: Sparkles, soon: true },
  { id: 'acerca', label: 'Acerca del sistema', icon: CircleHelp },
];

export default function AppShell({ current, onChange, children }: { current: PageId; onChange: (p: PageId) => void; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const select = (id: PageId) => { onChange(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <div className="app-layout">
      {mobileOpen && <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} role="presentation" />}
      <aside className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          


          <div className="min-w-0"><p className="text-[12px] font-extrabold tracking-[0.13em] text-white">HCBCDMX</p><p className="mt-0.5 text-[11px] text-white/55">Herramientas digitales</p></div>
          <button type="button" className="ml-auto block text-white/70 lg:hidden" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X size={20}/></button>
        </div>
        <div className="sidebar-divider" />
        <nav className="sidebar-navigation" aria-label="Secciones principales">
          <p className="sidebar-group-label">PLATAFORMA</p>
          {nav.slice(0, 3).map(item => <NavItem key={item.id} item={item} current={current} onClick={() => select(item.id)} />)}
          <p className="sidebar-group-label mt-8">PRÓXIMAMENTE</p>
          {nav.slice(3, 6).map(item => <NavItem key={item.id} item={item} current={current} onClick={() => select(item.id)} />)}
          <p className="sidebar-group-label mt-8">INFORMACIÓN</p>
          <NavItem item={nav[6]!} current={current} onClick={() => select('acerca')} />
        </nav>
        <div className="sidebar-bottom mt-auto">
          <div className="sidebar-safe"><ShieldCheck size={18} className="shrink-0 text-[#e5c497]"/><div><p className="text-[12px] font-semibold text-white">Procesamiento local</p><p className="mt-1 text-[11px] leading-relaxed text-white/55">Los PDF no se envían a servidores.</p></div></div>
          <p className="mt-5 text-[11px] text-white/35">Versión 1.0 · Uso sujeto a autorización</p>
        </div>
      </aside>
      <div className="app-main min-w-0">
        <header className="topbar">
          <button type="button" className="icon-button mr-2 lg:hidden" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu size={22}/></button>
          <div className="topbar-identity"><span className="topbar-title">HEROICO CUERPO DE BOMBEROS DE LA CIUDAD DE MÉXICO</span><span className="topbar-subtitle">Sistema Institucional de Gestión de Documentos PDF</span></div>
          
        </header>
        <main className="main-content">{children}</main>
        <footer className="main-footer"><span>HCBCDMX · Sistema Institucional de Gestión de Documentos PDF</span><span>Los documentos se procesan en tu navegador.</span></footer>
      </div>
    </div>
  );
}
function NavItem({ item, current, onClick }: { item: { id: PageId; label: string; icon: typeof Home; soon?: boolean }; current: PageId; onClick: () => void }) {
  const Icon = item.icon;
  return <button type="button" onClick={onClick} aria-current={current === item.id ? 'page' : undefined} className={`nav-item ${current === item.id ? 'nav-active' : ''}`}><Icon size={18} strokeWidth={1.8}/><span className="flex-1 text-left">{item.label}</span>{item.soon ? <span className="soon-dot" aria-label="Próximamente"/> : current === item.id ? <ChevronLeft size={13} className="rotate-180 opacity-60"/> : null}</button>;
}

export function StartHero({ navigate }: { navigate: (id: PageId) => void }) {
  return <section className="hero-panel relative overflow-hidden"><div className="hero-sheen"/><div className="relative z-10 max-w-2xl"><div className="hero-eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#f0c78b]"/> PLATAFORMA DE DOCUMENTOS</div><h1 className="mt-4 text-[27px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[36px]">Gestión documental <span className="text-[#f0c78b]">simple y segura.</span></h1><p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/78 sm:text-[14px]">Divide y extrae páginas de tus archivos PDF de forma eficiente, sin enviar información a servicios externos.</p><button type="button" className="hero-cta mt-6" onClick={() => navigate('dividir')}>Comenzar ahora <ArrowRight size={16}/></button></div><div className="hero-watermark"><FileText size={228} strokeWidth={0.6}/></div></section>;
}

export function Upcoming({ section, onGoBack }: { section: string; onGoBack: () => void }) {
  return <div className="panel mx-auto max-w-2xl px-8 py-14 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff5ee] text-[#8c1627]"><Archive size={29}/></div><p className="step-label mt-6">MÓDULO EN DESARROLLO</p><h1 className="mt-2 text-2xl font-bold text-slate-800">{section}</h1><p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-slate-500">Esta herramienta está prevista para una próxima versión. Aún no está habilitada: no se simulan operaciones ni descargas. La división y extracción de PDF sí están disponibles.</p><button type="button" className="primary-button mx-auto mt-6" onClick={onGoBack}>Ir a Dividir PDF <ArrowRight size={16}/></button></div>;
}

export function About() {
  return <div className="mx-auto max-w-4xl"><p className="section-kicker">ACERCA DE LA PLATAFORMA</p><h1 className="page-title mt-2">Información del sistema</h1><p className="page-description">Primera versión del sistema de gestión de PDF para uso institucional.</p><div className="mt-7 grid gap-5 md:grid-cols-2"><section className="panel p-6"><ShieldCheck className="text-[#8c1627]"/><h2 className="mt-4 text-[16px] font-bold text-slate-800">Privacidad por diseño</h2><p className="mt-2 text-[13px] leading-relaxed text-slate-600">La lectura, extracción y compresión ocurren en este navegador. No se incluyen servidores para procesar documentos, cuentas ni analítica documental.</p></section><section className="panel p-6"><LockKeyhole className="text-[#8c1627]"/><h2 className="mt-4 text-[16px] font-bold text-slate-800">Acceso institucional</h2><p className="mt-2 text-[13px] leading-relaxed text-slate-600">La publicación en Netlify no hace que un sitio sea privado. Para documentos sensibles, el área de TI deberá aprobar el alojamiento, las políticas de acceso y una solución de autenticación antes de distribuirlo.</p></section><section className="panel p-6"><BookOpen className="text-[#8c1627]"/><h2 className="mt-4 text-[16px] font-bold text-slate-800">Alcance de la versión</h2><p className="mt-2 text-[13px] leading-relaxed text-slate-600">Esta versión permite cargar y previsualizar PDF, extraer páginas individuales o rangos, y descargarlos por separado o en ZIP. Otras funciones están identificadas como futuras.</p></section><section className="panel p-6"><Flame className="text-[#8c1627]"/><h2 className="mt-4 text-[16px] font-bold text-slate-800">Identidad institucional</h2><p className="mt-2 text-[13px] leading-relaxed text-slate-600">Los símbolos gráficos presentes son genéricos. El escudo oficial solo deberá incorporarse con la autorización correspondiente.</p></section></div></div>;
}
