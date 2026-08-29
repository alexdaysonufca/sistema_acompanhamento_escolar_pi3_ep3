import React, { useState, useEffect, useRef } from "react";
import {
  Bell, User, ChevronDown, X, AlertTriangle, CheckCircle,
  FileText, BookOpen, Calendar, MessageSquare, Settings, HelpCircle,
  Printer, Download, Mail, ArrowLeft, Info, Eye, Check, Plus, Edit,
  ChevronLeft, ChevronRight, ChevronUp, Accessibility, Lock, Menu, RefreshCw, GraduationCap,
  Tag, Clock, Send, Megaphone, Trash2, CheckSquare, Sliders, CalendarDays,
  Code, ExternalLink, Users
} from "lucide-react";
import { tracesApi } from "../services/api";
import {
  ParentDependentSummary,
  ReportCardResponse,
  DetailedAssessmentsResponse,
  AttendanceCalendarResponse,
  AnnouncementItem,
  AnnouncementTag,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  ClassroomScope,
  AssessmentDetailItem,
  ClassScheduleConfig,
  ScheduleException,
} from "../types/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Screen =
  | "dashboard"
  | "boletim"
  | "notas"
  | "frequencia"
  | "avisos"
  | "professor"
  | "swagger_api"
  | "integrantes"
  | "sobre"
  | "docs_md";

export type Role = "PARENT" | "TEACHER" | "DEVELOPER";

const screenTitles: Record<Screen, string> = {
  dashboard: "Painel Principal — TrAcEs",
  boletim: "Boletim Escolar — TrAcEs",
  notas: "Notas Detalhadas — TrAcEs",
  frequencia: "Frequência e Calendário — TrAcEs",
  avisos: "Avisos e Comunicados — TrAcEs",
  professor: "Área do Docente — TrAcEs",
  swagger_api: "Documentação da API RESTful (Swagger UI) — TrAcEs",
  integrantes: "Integrantes da Equipe — TrAcEs",
  sobre: "Sobre o Projeto — TrAcEs",
  docs_md: "Documentação Técnica — TrAcEs",
};

// ─── Shared Layout: AccessibilityBar ─────────────────────────────────────────

function AccessibilityBar({
  highContrast,
  onToggleContrast,
}: {
  highContrast: boolean;
  onToggleContrast: () => void;
}) {
  const adjustFont = (delta: number) => {
    const root = document.documentElement;
    const current = parseFloat(root.style.fontSize || "100") || 100;
    const next = Math.min(140, Math.max(80, current + delta));
    root.style.fontSize = `${next}%`;
  };

  const baseClasses =
    "px-2 py-0.5 rounded text-xs font-medium focus:outline-none focus:bg-yellow-400 focus:text-black focus:font-bold focus:ring-2 focus:ring-black focus:shadow-md hover:underline transition-all";

  return (
    <div
      role="navigation"
      aria-label="Barra de acessibilidade"
      className={`w-full ${
        highContrast
          ? "bg-black text-yellow-300 border-b border-yellow-500/30"
          : "bg-[#1A2332] text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 py-1 text-xs font-medium flex-wrap gap-y-1">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
          <a href="#main-content" className={baseClasses}>
            Ir para conteúdo
          </a>
          <Sep />
          <a href="#main-nav" className={baseClasses}>
            Ir para menu
          </a>
          <Sep />
          <a href="#footer" className={baseClasses}>
            Ir para rodapé
          </a>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
          <button
            onClick={onToggleContrast}
            aria-pressed={highContrast}
            className={baseClasses}
          >
            Alto contraste
          </button>
          <Sep />
          <button
            onClick={() => adjustFont(10)}
            aria-label="Aumentar tamanho da fonte"
            className={baseClasses}
          >
            Fonte: A+
          </button>
          <button
            onClick={() => adjustFont(-10)}
            aria-label="Diminuir tamanho da fonte"
            className={baseClasses}
          >
            Fonte: A−
          </button>
          <button
            onClick={() => {
              document.documentElement.style.fontSize = "100%";
            }}
            aria-label="Restaurar tamanho padrão da fonte"
            className={baseClasses}
          >
            Fonte: A
          </button>
          <Sep />
          <button
            aria-label="Recursos de acessibilidade"
            className="px-2 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 flex items-center gap-1 hover:underline hidden xs:flex"
          >
            <Accessibility size={13} aria-hidden />
            Acessibilidade
          </button>
        </div>
      </div>
    </div>
  );
}

function Sep() {
  return <span aria-hidden className="opacity-30 px-0.5">|</span>;
}

// ─── Shared Layout: Header ───────────────────────────────────────────────────

function Header({
  onNavigate,
  currentScreen,
  highContrast,
  activeRole,
  onToggleRole,
}: {
  onNavigate: (s: Screen) => void;
  currentScreen: Screen;
  highContrast: boolean;
  activeRole: Role;
  onToggleRole: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems: { key: Screen; label: string }[] =
    activeRole === "TEACHER"
      ? [{ key: "professor", label: "Área Docente" }]
      : activeRole === "DEVELOPER"
      ? [
          { key: "swagger_api", label: "Documentação da API" },
          { key: "integrantes", label: "Integrantes" },
          { key: "sobre", label: "Sobre" },
          { key: "docs_md", label: "Documentação Técnica" },
        ]
      : [
          { key: "dashboard", label: "Início" },
          { key: "boletim", label: "Boletim" },
          { key: "notas", label: "Notas" },
          { key: "frequencia", label: "Frequência" },
          { key: "avisos", label: "Avisos" },
        ];

  return (
    <header
      id="main-nav"
      role="banner"
      className={`w-full ${
        highContrast
          ? "bg-black border-b-2 border-yellow-400"
          : activeRole === "TEACHER"
          ? "bg-[#0F3B6C]"
          : activeRole === "DEVELOPER"
          ? "bg-[#064E3B]"
          : "bg-[#1B4F8A]"
      } text-white transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => {
            onNavigate(
              activeRole === "TEACHER"
                ? "professor"
                : activeRole === "DEVELOPER"
                ? "integrantes"
                : "dashboard"
            );
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#1B4F8A] rounded p-1 text-left"
          aria-label="TrAcEs — Ir para o painel inicial"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5">
            <span className="text-[#1B4F8A] font-black text-base font-['Source_Serif_4']">
              Tr
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base sm:text-lg tracking-tight font-['Source_Serif_4'] flex items-center gap-1.5">
              TrAcEs
              {activeRole === "TEACHER" && (
                <span className="text-[10px] bg-yellow-400 text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Docente
                </span>
              )}
              {activeRole === "DEVELOPER" && (
                <span className="text-[10px] bg-emerald-400 text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Dev
                </span>
              )}
            </span>
            <span className="text-[10px] sm:text-xs text-white/90 hidden xs:inline">
              Trilha de Acompanhamento Escolar
            </span>
          </div>
        </button>

        {/* Navegação Desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-1 ml-4">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-current={currentScreen === key ? "page" : undefined}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400
                ${
                  currentScreen === key
                    ? "bg-white/25 text-white font-bold underline underline-offset-2"
                    : "text-white font-normal hover:bg-white/15 hover:underline"
                }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Ações & Perfil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alternador de Perfil (Responsável / Docente / Desenvolvedor) */}
          <button
            onClick={onToggleRole}
            title="Alternar entre Pais (Maria), Docente (Prof. Carlos) e Desenvolvedor (Dev Team)"
            aria-label={`Alternar perfil. Perfil atual: ${
              activeRole === "PARENT"
                ? "Responsável Maria"
                : activeRole === "TEACHER"
                ? "Professor Carlos"
                : "Modo Desenvolvedor"
            }`}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          >
            {activeRole === "PARENT" ? (
              <>
                <User size={13} className="text-yellow-300" aria-hidden />
                <span className="hidden sm:inline">Modo: Pais</span>
              </>
            ) : activeRole === "TEACHER" ? (
              <>
                <GraduationCap size={14} className="text-yellow-300" aria-hidden />
                <span className="hidden sm:inline">Modo: Docente</span>
              </>
            ) : (
              <>
                <Code size={14} className="text-emerald-300" aria-hidden />
                <span className="hidden sm:inline">Modo: Desenvolvedor</span>
              </>
            )}
            <RefreshCw size={11} className="opacity-70" aria-hidden />
          </button>

          {/* Sino de Notificações (exibido apenas no perfil Pais) */}
          {activeRole === "PARENT" && (
            <button
              aria-label="Notificações — 3 avisos não lidos"
              onClick={() => {
                onNavigate("avisos");
                setMobileMenuOpen(false);
              }}
              className="relative p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
            >
              <Bell size={20} aria-hidden />
              <span
                aria-hidden
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E74C3C] rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              >
                3
              </span>
            </button>
          )}

          {/* Nome do Usuário Ativo */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full hover:bg-white/10">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <User size={16} className="text-[#1B4F8A]" aria-hidden />
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {activeRole === "PARENT"
                ? "Maria Silva"
                : activeRole === "TEACHER"
                ? "Prof. Carlos"
                : "Equipe Dev"}
            </span>
          </div>

          {/* Hambúrguer Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-drawer"
            aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Menu Gaveta Mobile */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          role="navigation"
          aria-label="Menu móvel de navegação"
          className={`lg:hidden w-full border-t transition-all duration-300 shadow-inner ${
            highContrast
              ? "bg-black border-yellow-400 text-yellow-300"
              : "bg-[#143B66] border-white/15 text-white"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1.5">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  onNavigate(key);
                  setMobileMenuOpen(false);
                }}
                aria-current={currentScreen === key ? "page" : undefined}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  currentScreen === key
                    ? "bg-white/25 text-white font-bold border-l-4 border-yellow-400 pl-3"
                    : "hover:bg-white/10 text-white/90"
                }`}
              >
                <span>{label}</span>
                {currentScreen === key && (
                  <Check size={18} className="text-yellow-400" aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function StatusBadge({
  value,
  compact = false,
  iconOnly = false,
}: {
  value: number | null;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  if (value === null)
    return (
      <span
        className="text-[#4A5568] text-sm font-['JetBrains_Mono']"
        aria-label="Sem nota lançada"
      >
        —
      </span>
    );

  if (value >= 6.0)
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold ${
          compact ? "text-xs" : "text-sm"
        } text-[#1B6B3A]`}
        aria-label={`Aprovado — nota ${value.toFixed(1)}`}
      >
        <Check size={compact ? 12 : 14} aria-hidden />
        {!iconOnly ? (
          <span className="font-['JetBrains_Mono']">{value.toFixed(1)}</span>
        ) : (
          <span className="sr-only">Aprovado</span>
        )}
      </span>
    );

  if (value >= 4.0)
    return (
      <span
        className={`inline-flex items-center gap-1 font-black ${
          compact ? "text-xs" : "text-sm"
        } text-[#8F4300]`}
        aria-label={`Recuperação — nota ${value.toFixed(1)}`}
      >
        <AlertTriangle size={compact ? 12 : 14} aria-hidden />
        {!iconOnly ? (
          <span className="font-['JetBrains_Mono']">
            {value.toFixed(1).replace(".", ",")}
          </span>
        ) : (
          <span className="sr-only">Recuperação</span>
        )}
      </span>
    );

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        compact ? "text-xs" : "text-sm"
      } text-[#C0392B]`}
      aria-label={`Reprovado — nota ${value.toFixed(1)}`}
    >
      <X size={compact ? 12 : 14} aria-hidden />
      {!iconOnly ? (
        <span className="font-['JetBrains_Mono']">{value.toFixed(1)}</span>
      ) : (
        <span className="sr-only">Reprovado</span>
      )}
    </span>
  );
}

function GradeLegend() {
  return (
    <div
      className="flex flex-wrap gap-x-5 gap-y-2 text-xs bg-[#EEF2F7] border border-[#C8D5E8] rounded px-3 py-2"
      role="note"
      aria-label="Legenda: ícone mais cor mais texto descrevem cada situação"
    >
      <span className="flex items-center gap-1.5 text-[#1B6B3A] font-semibold">
        <Check size={13} aria-hidden />
        <span>Aprovado</span>
        <span className="font-normal text-[#374151]">(≥ 6,0)</span>
      </span>
      <span aria-hidden className="text-[#94A3B8] self-center">|</span>
      <span className="flex items-center gap-1.5 text-[#7D4E00] font-semibold">
        <AlertTriangle size={13} aria-hidden />
        <span>Recuperação</span>
        <span className="font-normal text-[#374151]">(4,0 – 5,9)</span>
      </span>
      <span aria-hidden className="text-[#94A3B8] self-center">|</span>
      <span className="flex items-center gap-1.5 text-[#C0392B] font-semibold">
        <X size={13} aria-hidden />
        <span>Reprovado</span>
        <span className="font-normal text-[#374151]">(&lt; 4,0)</span>
      </span>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-bold text-[#1A2332] uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#EEF2F7] border-2 border-[#6B7A8D] rounded-lg px-3 py-2.5 min-h-[44px] pr-8 text-sm text-[#1A2332] font-medium focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:ring-offset-1 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-3 text-[#374151] pointer-events-none"
          aria-hidden
        />
      </div>
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <nav aria-label="Localização atual" className="mb-4">
      <ol className="flex items-center gap-1 text-sm" role="list">
        <li>
          <button
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-[#1B4F8A] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] rounded"
          >
            <ArrowLeft size={15} aria-hidden /> {label}
          </button>
        </li>
      </ol>
    </nav>
  );
}

function ActionBar({
  onPrimary,
  primaryLabel,
  primaryIcon: PrimaryIcon,
}: {
  onPrimary: () => void;
  primaryLabel: string;
  primaryIcon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
}) {
  return (
    <section
      aria-label="Ações"
      className="bg-white rounded-xl border border-[#C8D5E8] p-5 shadow-sm print:hidden"
    >
      <h2 className="text-xs font-bold text-[#1A2332] uppercase tracking-widest mb-4">Ações</h2>
      <div className="flex flex-wrap gap-3">
        {[
          { icon: Printer, label: "Imprimir", action: () => window.print() },
          { icon: Download, label: "Baixar PDF", action: () => window.print() },
          {
            icon: Mail,
            label: "Enviar E-mail",
            action: () => alert("Relatório enviado para o seu e-mail cadastrado."),
          },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#EEF2F7] text-[#1A2332] border border-[#C8D5E8] hover:bg-[#D8E2EF] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:ring-offset-2 transition-colors"
          >
            <Icon size={15} aria-hidden />
            {label}
          </button>
        ))}
        <button
          onClick={onPrimary}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#1B4F8A] text-white hover:bg-[#15407A] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:ring-offset-2 transition-colors"
        >
          <PrimaryIcon size={15} aria-hidden />
          {primaryLabel}
        </button>
      </div>
    </section>
  );
}

// ─── Focus Trap Hook para Modais e Diálogos Acessíveis (WCAG 2.1.2 / 2.4.3) ───

function useModalFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  triggerRef?: React.RefObject<HTMLElement | null>
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null;

      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            focusables[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!modalRef.current) return;

        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === "Tab") {
          const focusables = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusables.length === 0) {
            e.preventDefault();
            return;
          }
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === "function") {
          setTimeout(() => {
            triggerElementRef.current?.focus();
          }, 50);
        }
      };
    }
  }, [isOpen, onClose, triggerRef]);

  return modalRef;
}

// ─── Screen 1: Dashboard ──────────────────────────────────────────────────────

function DashboardScreen({
  onNavigate,
  onSelectStudent,
}: {
  onNavigate: (s: Screen) => void;
  onSelectStudent: (id: number) => void;
}) {
  const [alertVisible, setAlertVisible] = useState(true);
  const [dependents, setDependents] = useState<ParentDependentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isMounted = true;
    mainRef.current?.focus();
    tracesApi
      .getDependents(1)
      .then((data) => {
        if (isMounted) setDependents(data);
      })
      .catch(() => {
        if (isMounted) {
          setDependents([
            {
              student_id: 1,
              name: "João Silva Oliveira",
              registration: "2024001",
              email: "joao.silva@aluno.escola.edu.br",
              classroom: "9º Ano A",
              shift: "MANHA",
              average_grade: 7.25,
              attendance_rate: 90.0,
              total_absences: 2,
              alerts: { critical_attendance: false, low_grades: false },
            },
            {
              student_id: 2,
              name: "Ana Silva Oliveira",
              registration: "2024002",
              email: "ana.silva@aluno.escola.edu.br",
              classroom: "6º Ano B",
              shift: "MANHA",
              average_grade: 5.8,
              attendance_rate: 72.0,
              total_absences: 8,
              alerts: { critical_attendance: true, low_grades: true },
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-6xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Painel principal"
    >
      <h1 className="text-3xl font-bold text-[#1A2332] mb-6 font-['Source_Serif_4']">
        Olá, Maria! <span aria-hidden>👋</span>
      </h1>

      {/* Alertas Importantes */}
      {alertVisible && (
        <section
          role="alert"
          aria-label="Alertas importantes"
          className="mb-6 bg-white rounded-xl shadow-sm border border-[#C8D5E8] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 bg-[#FFF0F0] border-b-2 border-[#C0392B]">
            <span className="font-bold text-sm text-[#7B1C1C] uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle size={16} aria-hidden />
              Alertas Importantes de Acompanhamento
            </span>
            <button
              onClick={() => setAlertVisible(false)}
              aria-label="Fechar alertas importantes"
              className="p-1.5 rounded text-[#7B1C1C] hover:bg-[#FECACA] focus:outline-none focus:ring-2 focus:ring-[#C0392B] transition-colors"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <ul className="divide-y divide-[#EEF2F7]" role="list">
            <li className="flex items-start gap-3 px-5 py-3 bg-white">
              <Calendar size={16} className="text-[#C0392B] mt-0.5 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mb-1 bg-[#FEE2E2] text-[#7B1C1C]">
                  Frequência Crítica
                </span>
                <p className="text-sm font-medium text-[#1A2332] leading-snug">
                  Ana Silva: Frequência em 72% em Matemática (abaixo do limite legal de 75%).
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectStudent(2);
                  onNavigate("frequencia");
                }}
                className="text-xs text-[#1B4F8A] font-bold underline underline-offset-2 flex-shrink-0 hover:text-[#15407A] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] rounded transition-colors"
              >
                Ver frequência
              </button>
            </li>
            <li className="flex items-start gap-3 px-5 py-3 bg-white">
              <BookOpen size={16} className="text-[#B45309] mt-0.5 flex-shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mb-1 bg-[#FEF3C7] text-[#78350F]">
                  Média Pedagógica
                </span>
                <p className="text-sm font-medium text-[#1A2332] leading-snug">
                  Ana Silva: Média bimestral em 5,8 (Recuperação em Português).
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectStudent(2);
                  onNavigate("boletim");
                }}
                className="text-xs text-[#1B4F8A] font-bold underline underline-offset-2 flex-shrink-0 hover:text-[#15407A] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] rounded transition-colors"
              >
                Ver boletim
              </button>
            </li>
          </ul>
        </section>
      )}

      {/* Meus Filhos (Dependentes) */}
      <section aria-labelledby="filhos-heading" className="mb-8" aria-busy={loading}>
        <h2
          id="filhos-heading"
          className="text-xs font-bold text-[#1A2332] uppercase tracking-widest mb-3 flex items-center justify-between"
        >
          <span>Meus Filhos (Acompanhamento Escolar)</span>
          {loading && (
            <span role="status" className="text-xs text-blue-600 font-normal">
              Atualizando dados... <span className="sr-only">Carregando informações dos dependentes.</span>
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dependents.map((dep) => {
            const hasAlert = dep.alerts.critical_attendance || dep.alerts.low_grades;
            return (
              <article
                key={dep.student_id}
                className={`bg-white rounded-xl shadow-sm border-2 ${
                  hasAlert ? "border-[#F0C0C0]" : "border-[#C8D5E8]"
                } p-4 sm:p-5 flex flex-col gap-3 transition-shadow hover:shadow-md`}
                aria-label={`${dep.name}, ${dep.classroom}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full ${
                      hasAlert ? "bg-[#f2a024]" : "bg-[#4ea6d9]"
                    } flex items-center justify-center flex-shrink-0 text-white font-bold text-lg font-['Source_Serif_4']`}
                    aria-hidden
                  >
                    {dep.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332] text-base">{dep.name}</p>
                    <p className="text-xs text-[#4A5568] font-medium mt-0.5">
                      Turma: {dep.classroom} · Matrícula: {dep.registration}
                    </p>
                  </div>
                  {hasAlert ? (
                    <span className="ml-auto text-[10px] font-bold text-[#C0392B] bg-[#FEE2E2] border border-[#F0C0C0] px-2 py-0.5 rounded-full">
                      Atenção
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] font-bold text-[#1B6B3A] bg-[#F0FFF4] border border-[#A8D5B5] px-2 py-0.5 rounded-full">
                      Regular
                    </span>
                  )}
                </div>

                {/* Métricas do Aluno */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`rounded-lg px-2.5 py-2 flex flex-col justify-center border ${
                      dep.average_grade >= 6.0
                        ? "bg-[#F0FFF4] border-[#A8D5B5]"
                        : "bg-[#FFF8E1] border-[#F0D080]"
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-[#1A2332] font-bold uppercase tracking-wide">
                      Média Geral
                    </p>
                    <p
                      className={`text-lg sm:text-xl font-black flex items-center gap-1 mt-0.5 ${
                        dep.average_grade >= 6.0 ? "text-[#14532D]" : "text-[#78350F]"
                      }`}
                    >
                      {dep.average_grade >= 6.0 ? (
                        <Check size={15} aria-hidden />
                      ) : (
                        <AlertTriangle size={15} aria-hidden />
                      )}
                      {dep.average_grade.toFixed(1)}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg px-2.5 py-2 flex flex-col justify-center border ${
                      dep.attendance_rate >= 75.0
                        ? "bg-[#F0FFF4] border-[#A8D5B5]"
                        : "bg-[#FFF0F0] border-[#F0C0C0]"
                    }`}
                  >
                    <p className="text-[10px] sm:text-xs text-[#1A2332] font-bold uppercase tracking-wide">
                      Assiduidade
                    </p>
                    <p
                      className={`text-lg sm:text-xl font-black flex items-center gap-1 mt-0.5 ${
                        dep.attendance_rate >= 75.0 ? "text-[#14532D]" : "text-[#7B1C1C]"
                      }`}
                    >
                      {dep.attendance_rate >= 75.0 ? (
                        <Check size={15} aria-hidden />
                      ) : (
                        <AlertTriangle size={15} aria-hidden />
                      )}
                      {dep.attendance_rate.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectStudent(dep.student_id);
                    onNavigate("boletim");
                  }}
                  className="mt-1 w-full py-2.5 bg-[#1B4F8A] text-white rounded-lg text-sm font-semibold hover:bg-[#15407A] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:ring-offset-2 transition-colors"
                  aria-label={`Ver boletim completo de ${dep.name}`}
                >
                  Ver Boletim Completo
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Menu Rápido */}
      <section aria-labelledby="menu-heading" className="mb-8">
        <h2 id="menu-heading" className="text-xs font-bold text-[#1A2332] uppercase tracking-widest mb-3">
          Menu Rápido
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: FileText, label: "Boletim", screen: "boletim" as Screen, badge: 0 },
            { icon: BookOpen, label: "Notas", screen: "notas" as Screen, badge: 0 },
            { icon: Calendar, label: "Frequência", screen: "frequencia" as Screen, badge: 0 },
            { icon: MessageSquare, label: "Avisos", screen: "avisos" as Screen, badge: 3 },
            { icon: GraduationCap, label: "Docente", screen: "professor" as Screen, badge: 0 },
            { icon: HelpCircle, label: "Suporte", screen: null, badge: 0 },
          ].map(({ icon: Icon, label, screen, badge }) => {
            const disabled = screen === null;
            return (
              <button
                key={label}
                onClick={() => !disabled && onNavigate(screen!)}
                aria-label={disabled ? `${label} — disponível em breve` : label}
                className={`relative flex flex-col items-center gap-2 rounded-xl py-4 px-2 transition-all group focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:ring-offset-2
                  ${
                    disabled
                      ? "bg-[#E8EDF5] border-2 border-[#6B7A8D] cursor-not-allowed"
                      : "bg-white border-2 border-[#C8D5E8] hover:bg-[#EEF2F7] hover:border-[#1B4F8A] cursor-pointer"
                  }`}
              >
                {disabled && (
                  <Lock size={9} className="absolute top-1.5 right-1.5 text-[#374151]" aria-hidden />
                )}
                <div className="relative">
                  <Icon
                    size={26}
                    className={disabled ? "text-[#374151]" : "text-[#1B4F8A] group-hover:text-[#15407A]"}
                    aria-hidden
                  />
                  {badge > 0 && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-2 w-4 h-4 bg-[#C0392B] rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold transition-colors ${
                    disabled ? "text-[#374151]" : "text-[#1A2332] group-hover:text-[#1B4F8A]"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

// ─── Screen 2: Boletim ───────────────────────────────────────────────────────

function BoletimScreen({
  onNavigate,
  studentId,
  onSelectStudent,
}: {
  onNavigate: (s: Screen) => void;
  studentId: number;
  onSelectStudent: (id: number) => void;
}) {
  const [ano, setAno] = useState("2026");
  const [reportCard, setReportCard] = useState<ReportCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isMounted = true;
    mainRef.current?.focus();
    setLoading(true);
    tracesApi
      .getReportCard(studentId, parseInt(ano))
      .then((data) => {
        if (isMounted) setReportCard(data);
      })
      .catch((err) => console.warn("Usando fallback de boletim:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId, ano]);

  const reportItems = reportCard?.report || [];
  const validGrades = reportItems.map((r) => r.final_average).filter((g): g is number => g !== null);
  const mediaGeral =
    validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1) : "7.2";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-6xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Boletim escolar"
    >
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("dashboard")} />
      <h1 className="text-3xl font-bold text-[#1A2332] mb-6 font-['Source_Serif_4']">
        Boletim Escolar
      </h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-[#C8D5E8] p-5 mb-5 shadow-sm print:hidden">
        <div className="flex flex-wrap gap-5">
          <div className="min-w-[260px]">
            <SelectField
              id="sel-aluno"
              label="Selecionar Aluno(a)"
              value={
                studentId === 1
                  ? "João Silva Oliveira (9º Ano A)"
                  : studentId === 2
                  ? "Ana Silva Oliveira (6º Ano B)"
                  : "Pedro Costa Santos (9º Ano A)"
              }
              onChange={(val) => {
                if (val.includes("Ana")) onSelectStudent(2);
                else if (val.includes("Pedro")) onSelectStudent(3);
                else onSelectStudent(1);
              }}
              options={[
                "João Silva Oliveira (9º Ano A)",
                "Ana Silva Oliveira (6º Ano B)",
                "Pedro Costa Santos (9º Ano A)",
              ]}
            />
          </div>
          <div className="min-w-[120px]">
            <SelectField
              id="sel-ano"
              label="Selecionar Ano"
              value={ano}
              onChange={setAno}
              options={["2026", "2025"]}
            />
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <section
        aria-label="Resumo geral do aluno"
        className="bg-white rounded-xl border border-[#C8D5E8] p-5 mb-5 shadow-sm"
      >
        <h2 className="text-xs font-bold text-[#1A2332] uppercase tracking-widest mb-4">
          Resumo Geral — {reportCard?.student_name || (studentId === 1 ? "João Silva" : "Ana Silva")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#374151] font-semibold mb-0.5">Série / Turma</p>
            <p className="font-bold text-[#1A2332] text-base">
              {reportCard?.classroom || (studentId === 1 ? "9º Ano A" : "6º Ano B")} — Manhã
            </p>
          </div>
          <div>
            <p className="text-xs text-[#374151] font-semibold mb-0.5">Média Geral</p>
            <p className="font-bold text-[#1B6B3A] text-base flex items-center gap-1">
              <Check size={14} aria-hidden /> {mediaGeral}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#374151] font-semibold mb-0.5">Frequência</p>
            <p className="font-bold text-[#1B6B3A] text-base flex items-center gap-1">
              <Check size={14} aria-hidden /> {studentId === 1 ? "90%" : "72%"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#374151] font-semibold mb-0.5">Situação Atual</p>
            <p className="font-bold text-[#1B6B3A] text-base flex items-center gap-1">
              <Check size={14} aria-hidden /> Em Andamento
            </p>
          </div>
        </div>
      </section>

      {/* Tabela de Notas */}
      <section
        aria-label="Notas por disciplina e bimestre"
        className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-5 overflow-hidden"
        aria-busy={loading}
      >
        <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#1A2332] uppercase tracking-widest">
            Rendimento por Disciplina e Bimestre (Ano Letivo {ano})
          </h2>
          {loading && (
            <span role="status" className="text-xs text-blue-600 font-semibold">
              Carregando dados... <span className="sr-only">Carregando boletim escolar oficial.</span>
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label={`Boletim de notas de ${studentId === 1 ? "João" : "Ana"}`}>
            <thead>
              <tr className="bg-[#EEF2F7] border-b border-[#C8D5E8]">
                {["Disciplina", "Professor(a)", "1º Bim", "2º Bim", "3º Bim", "4º Bim", "Média", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left px-4 py-3 font-bold text-[#1A2332] text-xs uppercase tracking-wide first:pl-5"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {reportItems.map((row, i) => (
                <tr
                  key={row.subject}
                  className={`border-b border-[#C8D5E8] hover:bg-[#EEF2F7] transition-colors ${
                    i % 2 === 1 ? "bg-[#F8FAFD]" : "bg-white"
                  }`}
                >
                  <td className="pl-5 pr-4 py-3 font-semibold text-[#1A2332]">{row.subject}</td>
                  <td className="px-4 py-3 text-[#2D3748]">{row.teacher}</td>
                  <td className="px-4 py-3 text-center font-['JetBrains_Mono'] text-[#1A2332]">
                    {row.bimester_grades["1"] !== null ? row.bimester_grades["1"].toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center font-['JetBrains_Mono'] text-[#1A2332]">
                    {row.bimester_grades["2"] !== null ? row.bimester_grades["2"].toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center font-['JetBrains_Mono'] text-[#1A2332]">
                    {row.bimester_grades["3"] !== null ? row.bimester_grades["3"].toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center font-['JetBrains_Mono'] text-[#374151]">
                    {row.bimester_grades["4"] !== null ? row.bimester_grades["4"].toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={row.final_average} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block border text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        row.status === "Aprovado"
                          ? "bg-[#F0FFF4] border-[#A8D5B5] text-[#1B6B3A]"
                          : row.status === "Recuperação"
                          ? "bg-[#FFF8E1] border-[#F0D080] text-[#7D4E00]"
                          : "bg-[#EEF2F7] border-[#C8D5E8] text-[#1A2332]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#C8D5E8]">
          <GradeLegend />
        </div>
      </section>

      <ActionBar
        onPrimary={() => onNavigate("notas")}
        primaryLabel="Ver Notas Detalhadas"
        primaryIcon={BookOpen}
      />
    </main>
  );
}

// ─── Screen 3: Notas Detalhadas ───────────────────────────────────────────────

function NotasScreen({
  onNavigate,
  studentId,
  onSelectStudent,
}: {
  onNavigate: (s: Screen) => void;
  studentId: number;
  onSelectStudent: (id: number) => void;
}) {
  const [disciplina, setDisciplina] = useState("Matemática");
  const [ano, setAno] = useState("2026");
  const [details, setDetails] = useState<DetailedAssessmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const fetchDetails = () => {
    setLoading(true);
    tracesApi
      .getDetailedAssessments(studentId, disciplina, parseInt(ano))
      .then((data) => setDetails(data))
      .catch((err) => console.warn("Erro ao buscar notas detalhadas:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    mainRef.current?.focus();
    fetchDetails();
  }, [studentId, disciplina, ano]);

  const bimesters = details?.bimesters || [];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-6xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Notas detalhadas"
    >
      <BackLink label="Voltar ao Boletim" onClick={() => onNavigate("boletim")} />

      <h1 className="text-3xl font-bold text-[#1A2332] mb-6 font-['Source_Serif_4']">
        Notas Detalhadas por Avaliação
      </h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-[#C8D5E8] p-5 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-5">
          <div className="min-w-[260px]">
            <SelectField
              id="nd-aluno"
              label="Selecionar Aluno(a)"
              value={
                studentId === 1
                  ? "João Silva Oliveira (9º Ano A)"
                  : studentId === 2
                  ? "Ana Silva Oliveira (6º Ano B)"
                  : "Pedro Costa Santos (9º Ano A)"
              }
              onChange={(val) => {
                if (val.includes("Ana")) onSelectStudent(2);
                else if (val.includes("Pedro")) onSelectStudent(3);
                else onSelectStudent(1);
              }}
              options={[
                "João Silva Oliveira (9º Ano A)",
                "Ana Silva Oliveira (6º Ano B)",
                "Pedro Costa Santos (9º Ano A)",
              ]}
            />
          </div>
          <div className="min-w-[120px]">
            <SelectField
              id="nd-ano"
              label="Selecionar Ano"
              value={ano}
              onChange={setAno}
              options={["2026", "2025"]}
            />
          </div>
          <div className="min-w-[180px]">
            <SelectField
              id="nd-disc"
              label="Selecionar Disciplina"
              value={disciplina}
              onChange={setDisciplina}
              options={["Matemática", "Português", "História", "Ciências", "Geografia", "Artes"]}
            />
          </div>
        </div>
      </div>

      {/* Cabeçalho do Componente */}
      <div className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-[#EEF2F7]">
          <p className="font-bold text-[#1A2332] text-base">
            {details?.classroom || (studentId === 2 ? "6º Ano B" : "9º Ano A")} — Manhã
          </p>
        </div>
        <div className="px-5 py-3 bg-[#F8FAFD] flex items-center justify-between" aria-busy={loading}>
          <p className="font-bold text-[#1B4F8A] text-base">
            {disciplina} — {disciplina === "Matemática" || disciplina === "Português" ? "Prof. Carlos Mendes" : "Profa. Patrícia Lima"}
          </p>
          {loading && (
            <span role="status" className="text-xs text-blue-600 font-semibold">
              Atualizando... <span className="sr-only">Carregando composição detalhada de notas.</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabelas por Bimestre */}
      {bimesters.map((bim) => (
        <section
          key={bim.bimester}
          aria-label={`Notas do ${bim.bimester_name}`}
          className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#EEF2F7]">
            <h2 className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4']">
              {bim.bimester_name}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EEF2F7] bg-[#FAFBFD]">
                  {["Avaliação", "Tipo", "Peso", "Nota", "Status"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className={`py-3 font-bold text-[#1A2332] text-xs uppercase tracking-wide ${
                        h === "Avaliação" || h === "Tipo" ? "text-left px-5" : "text-center px-4"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bim.assessments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-xs text-[#6B7A8D]">
                      Nenhuma avaliação lançada neste bimestre até o momento.
                    </td>
                  </tr>
                ) : (
                  bim.assessments.map((item, index) => (
                    <tr key={item.id || index} className="bg-white hover:bg-[#EEF2F7] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#1A2332]">
                        <div className="font-bold text-[#1B4F8A]">
                          {item.seq_title || `Avaliação ${index + 1}`}
                        </div>
                        {item.description && (
                          <div className="text-xs text-[#4A5568]">{item.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#2D3748]">{item.type}</td>
                      <td className="px-4 py-3 text-center font-['JetBrains_Mono'] text-[#1A2332]">
                        {item.weight.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center font-['JetBrains_Mono'] font-bold text-[#1A2332]">
                        {item.score.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={item.score} iconOnly />
                      </td>
                    </tr>
                  ))
                )}
                {bim.average !== null && (
                  <tr className="bg-[#F0F4FA] border-t-2 border-[#C8D5E8]">
                    <td colSpan={3} className="px-5 py-3 font-bold text-[#1A2332] text-sm">
                      Média Ponderada do Bimestre ({bim.bimester_name}):
                    </td>
                    <td className="px-4 py-3 text-center font-bold font-['JetBrains_Mono'] text-[#1A2332] text-base">
                      {bim.average.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge value={bim.average} iconOnly />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Média Anual e Fórmula */}
      <div className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#1A2332]">Média Ponderada Atual:</span>
            <span className="text-xl font-bold text-[#1B6B3A] font-['JetBrains_Mono']">
              {details?.annual_average ? details.annual_average.toFixed(2) : "8.00"}
            </span>
            <Check size={18} className="text-[#1B6B3A]" aria-label="Aprovado" />
          </div>
          <div className="text-xs text-[#4A5568] font-['JetBrains_Mono']">
            Fórmula: <code>Σ(nota × peso) / Σ(peso)</code>
          </div>
        </div>
      </div>

      <ActionBar onPrimary={() => onNavigate("boletim")} primaryLabel="Ver Boletim" primaryIcon={FileText} />
    </main>
  );
}

// ─── Screen 4: Frequência ─────────────────────────────────────────────────────

function FrequenciaScreen({
  onNavigate,
  studentId,
  onSelectStudent,
}: {
  onNavigate: (s: Screen) => void;
  studentId: number;
  onSelectStudent: (id: number) => void;
}) {
  const [disciplina, setDisciplina] = useState("Matemática");
  const [mesNome, setMesNome] = useState("Março");
  const [ano, setAno] = useState("2026");
  const [attData, setAttData] = useState<AttendanceCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const MONTH_TO_NUM: Record<string, number> = {
    Fevereiro: 2,
    Março: 3,
    Abril: 4,
    Maio: 5,
    Junho: 6,
    Julho: 7,
    Agosto: 8,
    Setembro: 9,
    Outubro: 10,
    Novembro: 11,
    Dezembro: 12,
  };

  const mesNum = MONTH_TO_NUM[mesNome] || 3;

  // Carregar dados da API e sincronizar com lançamentos do docente
  useEffect(() => {
    let isMounted = true;
    mainRef.current?.focus();
    setLoading(true);

    tracesApi
      .getAttendanceCalendar(studentId, disciplina, mesNum, parseInt(ano))
      .then((data) => {
        if (isMounted) setAttData(data);
      })
      .catch((err) => console.warn("Erro ao buscar calendário:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [studentId, disciplina, mesNome, ano]);

  // Recuperar configuração de vigência/horários e chamadas publicadas pelo professor
  const savedScheduleConfig: ClassScheduleConfig = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("traces_schedule_config");
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      classroomId: 1,
      subject: "Matemática",
      bimester: mesNum <= 4 ? "1º BM" : mesNum <= 7 ? "2º BM" : mesNum <= 10 ? "3º BM" : "4º BM",
      academicYear: 2026,
      startDate: "2026-02-02",
      endDate: "2026-04-30",
      lessonDuration: 50,
      weeklyDays: [1, 3], // Seg e Qua
      dailyLessons: {
        1: { lessonCount: 2, slotsText: "1º e 2º tempos (07:30 - 09:10)", startTime: "07:30", endTime: "09:10" },
        2: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
        3: { lessonCount: 2, slotsText: "1º e 2º tempos (07:30 - 09:10)", startTime: "07:30", endTime: "09:10" },
        4: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
        5: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
        6: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
      },
      exceptions: [
        { id: "exc-1", date: "2026-02-16", type: "NO_CLASS", reason: "Recesso de Carnaval" },
        { id: "exc-2", date: "2026-02-17", type: "NO_CLASS", reason: "Feriado de Carnaval" },
        { id: "exc-3", date: "2026-02-18", type: "NO_CLASS", reason: "Quarta-feira de Cinzas" },
        { id: "exc-4", date: "2026-03-20", type: "NO_CLASS", reason: "Conselho Pedagógico" },
        { id: "exc-5", date: "2026-04-18", type: "EXTRA", reason: "Aula de Reposição de Sábado", lessonCount: 2 },
      ],
    };
  }, [mesNum, disciplina]);

  // Sincronização em tempo real com lançamentos do docente salvos localmente
  const publishedAttendance = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("traces_published_attendance");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed[studentId]?.[`${ano}-${String(mesNum).padStart(2, "0")}`] || null;
      }
    } catch {}
    return null;
  }, [studentId, mesNum, ano]);

  // Calcular dias e sumário consolidados
  const { calendarDays, summary } = React.useMemo(() => {
    const yearInt = parseInt(ano) || 2026;
    const daysInMonth = new Date(yearInt, mesNum, 0).getDate();
    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const days: AttendanceCalendarDay[] = [];

    let totalClasses = 0;
    let presences = 0;
    let absences = 0;
    let justifiedAbsences = 0;

    // Se temos dados publicados pelo docente para este mês, usamos como fonte prioritária
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(yearInt, mesNum - 1, d);
      const dayOfWeek = curDate.getDay();
      const isoDate = `${yearInt}-${String(mesNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Verificar se é dia letivo configurado
      const isExceptionNoClass = savedScheduleConfig.exceptions.some(
        (e) => e.date === isoDate && e.type === "NO_CLASS"
      );
      const exceptionExtra = savedScheduleConfig.exceptions.find(
        (e) => e.date === isoDate && e.type === "EXTRA"
      );
      const isRegularClassDay = savedScheduleConfig.weeklyDays.includes(dayOfWeek);

      const hasClass = (isRegularClassDay && !isExceptionNoClass) || Boolean(exceptionExtra);
      const lessonsInDay = exceptionExtra
        ? exceptionExtra.lessonCount || 2
        : isRegularClassDay
        ? savedScheduleConfig.dailyLessons[dayOfWeek]?.lessonCount || 2
        : 0;

      let status: "PRESENT" | "ABSENT" | "JUSTIFIED_ABSENCE" | "NO_CLASS" = "NO_CLASS";

      if (hasClass) {
        totalClasses += lessonsInDay;

        // Checar lançamento do professor
        const customCode = publishedAttendance?.[isoDate];

        if (customCode) {
          if (customCode === "2P" || customCode === "1P" || (customCode.endsWith("P") && !customCode.includes("1F"))) {
            status = "PRESENT";
            presences += lessonsInDay;
          } else if (customCode === "2FJ" || customCode === "1FJ" || customCode.endsWith("FJ")) {
            status = "JUSTIFIED_ABSENCE";
            justifiedAbsences += lessonsInDay;
            presences += lessonsInDay;
          } else if (customCode === "1P 1F") {
            status = "ABSENT";
            presences += 1;
            absences += 1;
          } else {
            status = "ABSENT";
            absences += lessonsInDay;
          }
        } else {
          // Padrão do backend / mock caso não tenha sido editado pelo docente
          if (studentId === 1) {
            if (d === 11) {
              status = "JUSTIFIED_ABSENCE";
              justifiedAbsences += lessonsInDay;
              presences += lessonsInDay;
            } else if (d === 18 && mesNum === 3) {
              status = "ABSENT";
              absences += lessonsInDay;
            } else {
              status = "PRESENT";
              presences += lessonsInDay;
            }
          } else {
            if (d % 4 === 0) {
              status = "ABSENT";
              absences += lessonsInDay;
            } else {
              status = "PRESENT";
              presences += lessonsInDay;
            }
          }
        }
      }

      days.push({
        day: d,
        date: isoDate,
        weekday: weekdayNames[dayOfWeek],
        status,
        is_weekend: isWeekend,
      });
    }

    const calculatedRate = totalClasses > 0 ? (presences / totalClasses) * 100 : 100;

    return {
      calendarDays: days,
      summary: {
        total_classes: totalClasses || 20,
        presences: presences || (studentId === 1 ? 18 : 14),
        absences: absences || (studentId === 1 ? 2 : 6),
        justified_absences: justifiedAbsences,
        attendance_rate: calculatedRate,
        minimum_rate: 75.0,
      },
    };
  }, [ano, mesNum, studentId, savedScheduleConfig, publishedAttendance]);

  function dayStyle(s: string) {
    if (s === "PRESENT") return "bg-[#E6F4EA] border border-[#A3CFBB] text-[#0B4622]";
    if (s === "ABSENT") return "bg-[#FCE8E6] border border-[#F5C2C7] text-[#7A1C1C]";
    if (s === "JUSTIFIED_ABSENCE")
      return "bg-[#2D3748] border border-[#1A2332] text-white ring-2 ring-[#1A2332]";
    return "bg-[#F1F3F5] border border-[#CED4DA] text-[#2D3748]";
  }

  const bimesterName =
    mesNum <= 4 ? "1º Bimestre" : mesNum <= 7 ? "2º Bimestre" : mesNum <= 10 ? "3º Bimestre" : "4º Bimestre";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-6xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Frequência e calendário"
    >
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("dashboard")} />

      <div className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#1B4F8A] flex-shrink-0" aria-hidden />
          <h1 className="text-base font-bold text-[#1A2332]">
            Frequência —{" "}
            {studentId === 1
              ? "João Silva Oliveira"
              : studentId === 2
              ? "Ana Silva Oliveira"
              : "Pedro Costa Santos"}{" "}
            — {ano}
          </h1>
        </div>
        <span className="text-xs font-bold text-[#0B4622] bg-[#E6F4EA] px-3 py-1 rounded-full border border-[#A3CFBB] flex items-center gap-1">
          <CheckCircle size={13} /> Sincronizado com Diário Docente
        </span>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-[#C8D5E8] p-5 mb-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SelectField
            id="fr-aluno"
            label="Aluno(a)"
            value={
              studentId === 1
                ? "João Silva Oliveira (9º Ano A)"
                : studentId === 2
                ? "Ana Silva Oliveira (6º Ano B)"
                : "Pedro Costa Santos (9º Ano A)"
            }
            onChange={(val) => {
              if (val.includes("Ana")) onSelectStudent(2);
              else if (val.includes("Pedro")) onSelectStudent(3);
              else onSelectStudent(1);
            }}
            options={[
              "João Silva Oliveira (9º Ano A)",
              "Ana Silva Oliveira (6º Ano B)",
              "Pedro Costa Santos (9º Ano A)",
            ]}
          />
          <SelectField
            id="fr-disc"
            label="Disciplina"
            value={disciplina}
            onChange={setDisciplina}
            options={["Matemática", "Português", "História", "Ciências"]}
          />
          <SelectField
            id="fr-mes"
            label="Mês"
            value={mesNome}
            onChange={setMesNome}
            options={[
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
            ]}
          />
          <SelectField id="fr-ano" label="Ano" value={ano} onChange={setAno} options={["2026", "2025"]} />
        </div>
      </div>

      {/* Resumo do Mês */}
      <section
        aria-label="Resumo de frequência"
        className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-[#EEF2F7] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-[#1B4F8A]" aria-hidden />
            <h2 className="text-sm font-bold text-[#1A2332]">
              Resumo de Frequência em {disciplina} ({mesNome}/{ano})
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#4A5568]">
            Referência: <strong>{bimesterName}</strong>
          </span>
        </div>
        <ul className="divide-y divide-[#EEF2F7]" role="list">
          <li className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#1A2332]">Presenças:</span>
            <span className="font-bold font-['JetBrains_Mono'] text-base text-[#1B6B3A]">
              {summary.presences}/{summary.total_classes} ({summary.attendance_rate.toFixed(0)}%)
            </span>
          </li>
          <li className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#1A2332]">Faltas Registradas:</span>
            <span className="font-bold font-['JetBrains_Mono'] text-base text-[#C0392B]">
              {summary.absences}
            </span>
          </li>
          <li className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-[#1A2332]">Faltas Justificadas:</span>
            <span className="font-bold font-['JetBrains_Mono'] text-base text-[#7D4E00]">
              {summary.justified_absences}
            </span>
          </li>
          <li className="flex items-center justify-between px-5 py-3 bg-[#F8FAFD]">
            <span className="text-sm font-medium text-[#1A2332]">Limite Legal Mínimo:</span>
            <span className="font-bold font-['JetBrains_Mono'] text-base text-[#1B4F8A]">
              75% de Assiduidade (LDB Art. 24, VI)
            </span>
          </li>
        </ul>
      </section>

      {/* NOVA SEÇÃO: Informações da Grade Curricular, Horários e Vigência Cadastrados pelo Docente */}
      <section
        aria-label="Grade curricular e horários cadastrados"
        className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-[#EEF2F7] bg-[#FAFBFD] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#1B4F8A]" aria-hidden />
            <h2 className="text-sm font-bold text-[#1A2332] font-['Source_Serif_4']">
              Grade Curricular, Horários e Vigência — {disciplina} ({savedScheduleConfig.bimester || "1º BM"})
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#1B4F8A] bg-white px-2.5 py-1 rounded-md border border-[#C8D5E8]">
            Docente: Prof. Carlos Mendes
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#1A2332]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Card 1: Vigência */}
            <div className="p-3 bg-[#FAFBFD] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 font-bold text-[#1B4F8A] uppercase text-[10px] mb-1">
                <CalendarDays size={13} /> Período de Vigência
              </div>
              <p className="font-bold font-['JetBrains_Mono'] text-[#1A2332]">
                {savedScheduleConfig.startDate} até {savedScheduleConfig.endDate}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Ano Letivo {savedScheduleConfig.academicYear}</p>
            </div>

            {/* Card 2: Duração dos Tempos */}
            <div className="p-3 bg-[#FAFBFD] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 font-bold text-[#1B4F8A] uppercase text-[10px] mb-1">
                <Clock size={13} /> Duração por Tempo
              </div>
              <p className="font-bold text-sm text-[#1A2332]">
                {savedScheduleConfig.lessonDuration} minutos
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Carga horária padrão da disciplina</p>
            </div>

            {/* Card 3: Dias com Aulas */}
            <div className="p-3 bg-[#FAFBFD] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 font-bold text-[#1B4F8A] uppercase text-[10px] mb-1">
                <Sliders size={13} /> Dias de Aula na Semana
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {[
                  { d: 1, name: "Segunda" },
                  { d: 2, name: "Terça" },
                  { d: 3, name: "Quarta" },
                  { d: 4, name: "Quinta" },
                  { d: 5, name: "Sexta" },
                  { d: 6, name: "Sábado" },
                ]
                  .filter((w) => savedScheduleConfig.weeklyDays.includes(w.d))
                  .map((w) => (
                    <span
                      key={w.d}
                      className="px-2 py-0.5 rounded bg-[#1B4F8A] text-white font-bold text-[10px]"
                    >
                      {w.name} ({savedScheduleConfig.dailyLessons[w.d]?.lessonCount || 2}T)
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Horários Detalhados por Dia */}
          <div className="p-3.5 bg-white rounded-xl border border-[#CBD5E1] space-y-2">
            <h3 className="font-bold text-[11px] text-[#1A2332] uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={13} className="text-[#059669]" /> Horários e Disposição dos Tempos de Aula (07:00 às 22:00)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { d: 1, name: "Segunda-feira" },
                { d: 2, name: "Terça-feira" },
                { d: 3, name: "Quarta-feira" },
                { d: 4, name: "Quinta-feira" },
                { d: 5, name: "Sexta-feira" },
                { d: 6, name: "Sábado Letivo" },
              ]
                .filter((w) => savedScheduleConfig.weeklyDays.includes(w.d))
                .map((w) => {
                  const lesson = savedScheduleConfig.dailyLessons[w.d] || {
                    lessonCount: 2,
                    slotsText: "1º e 2º tempos (07:30 - 09:10)",
                    startTime: "07:30",
                    endTime: "09:10",
                  };
                  return (
                    <div
                      key={w.d}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]"
                    >
                      <span className="font-bold text-[#1A2332]">{w.name}</span>
                      <span className="font-['JetBrains_Mono'] text-[#1B4F8A] font-bold text-[11px]">
                        {lesson.startTime || "07:30"} - {lesson.endTime || "09:10"} ({lesson.lessonCount} tempos)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Exceções e Calendário do Mês */}
          {savedScheduleConfig.exceptions.length > 0 && (
            <div className="p-3.5 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] space-y-2">
              <h3 className="font-bold text-[11px] text-[#92400E] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-[#D97706]" /> Exceções do Calendário Escolar Cadastradas pelo Professor
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {savedScheduleConfig.exceptions.map((exc) => (
                  <span
                    key={exc.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                      exc.type === "NO_CLASS"
                        ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                        : "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                    }`}
                  >
                    <strong>{exc.date}</strong>: {exc.reason} ({exc.type === "NO_CLASS" ? "Sem Aula" : `Aula Extra ${exc.lessonCount || 2}T`})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Calendário Tátil / Visual */}
      <section
        aria-label="Calendário de frequência"
        className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EEF2F7]" aria-busy={loading}>
          <div className="flex gap-3 items-center">
            <span className="font-bold text-[#1A2332] text-sm">{mesNome}</span>
            <span className="font-bold text-[#4A5568] text-xs font-['JetBrains_Mono']">{ano}</span>
          </div>
          {loading && (
            <span role="status" className="text-xs text-blue-600 font-semibold">
              Atualizando... <span className="sr-only">Carregando calendário de frequência escolar.</span>
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2" aria-hidden>
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((abbr) => (
              <span key={abbr} className="text-center text-xs font-bold text-[#4A5568] py-1 block">
                {abbr}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1" role="grid">
            {calendarDays.map((d) => (
              <div
                key={d.day}
                role="gridcell"
                className={`rounded-md text-center min-h-[44px] flex flex-col items-center justify-center cursor-default transition-colors ${dayStyle(
                  d.status
                )}`}
              >
                <span className="text-[10px] font-bold leading-none mb-0.5">{d.day}</span>
                <span className="font-bold text-[11px] leading-tight">
                  {d.status === "PRESENT"
                    ? "[P]"
                    : d.status === "JUSTIFIED_ABSENCE"
                    ? "[F*]"
                    : d.status === "ABSENT"
                    ? "[F]"
                    : "[-]"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="px-5 pb-5 pt-1">
          <p className="text-xs font-bold text-[#1A2332] uppercase tracking-wide mb-2">Legenda:</p>
          <div className="flex flex-wrap gap-3" role="list">
            {[
              { code: "P", label: "Presente", tc: "#1B6B3A", bg: "#F0FFF4", bd: "#A8D5B5" },
              { code: "F", label: "Falta", tc: "#C0392B", bg: "#FFF0F0", bd: "#F0C0C0" },
              { code: "F*", label: "Falta Justificada (Atestado)", tc: "#ffffff", bg: "#374151", bd: "#1A2332" },
              { code: "–", label: "Sem Aula", tc: "#4A5568", bg: "#EEF2F7", bd: "#C8D5E8" },
            ].map(({ code, label, tc, bg, bd }) => (
              <div key={code} role="listitem" className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center justify-center w-8 h-7 rounded text-xs font-bold border"
                  style={{ color: tc, backgroundColor: bg, borderColor: bd }}
                  aria-hidden
                >
                  {code}
                </span>
                <span className="text-xs text-[#1A2332] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ActionBar onPrimary={() => onNavigate("boletim")} primaryLabel="Ver Boletim" primaryIcon={FileText} />
    </main>
  );
}

// ─── Screen 5: Avisos ─────────────────────────────────────────────────────────

function AvisosScreen({
  onNavigate,
  studentId = 1,
  onSelectStudent,
}: {
  onNavigate: (s: Screen) => void;
  studentId?: number;
  onSelectStudent?: (id: number) => void;
}) {
  const [avisos, setAvisos] = useState<AnnouncementItem[]>([]);
  const [dependents, setDependents] = useState<ParentDependentSummary[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<number>(studentId);
  const [lidos, setLidos] = useState<number[]>([]);
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const loadAvisos = async (stId: number) => {
    setLoading(true);
    try {
      const data = await tracesApi.getAnnouncements(stId);
      setAvisos(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mainRef.current?.focus();
    tracesApi.getDependents(1).then(setDependents).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentStudentId(studentId);
    loadAvisos(studentId);
  }, [studentId]);

  const handleStudentChange = (id: number) => {
    setCurrentStudentId(id);
    if (onSelectStudent) onSelectStudent(id);
    loadAvisos(id);
  };

  const handleMarcarComoLido = async (id: number) => {
    try {
      await tracesApi.markAnnouncementAsRead(id);
      setLidos((prev) => [...prev, id]);
      setAvisos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true, read_at: "Agora" } : a))
      );
      setToastMsg("✅ Aviso marcado como lido com sucesso!");
      setTimeout(() => setToastMsg(null), 4000);
    } catch {
      setLidos((prev) => [...prev, id]);
    }
  };

  const selectedStudent = dependents.find((d) => d.student_id === currentStudentId) || dependents[0];

  // Ordenação por padrão: 1º mais recente de publicação (data desc), 2º ordem alfabética de assunto (título asc)
  const sortAvisos = (a: AnnouncementItem, b: AnnouncementItem) => {
    const dateA = a.date_published || "";
    const dateB = b.date_published || "";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    const titleA = a.title || "";
    const titleB = b.title || "";
    return titleA.localeCompare(titleB, "pt-BR", { sensitivity: "base" });
  };

  const naoLidos = avisos.filter((a) => !lidos.includes(a.id) && !a.is_read).sort(sortAvisos);
  const avisosLidos = avisos.filter((a) => lidos.includes(a.id) || a.is_read).sort(sortAvisos);

  // Renderiza o card do aviso preservando exatamente o mesmo layout e formato
  const renderAvisoCard = (aviso: AnnouncementItem, isLido: boolean) => {
    const expanded = expandidos.includes(aviso.id);
    const cat = aviso.category || "GENERAL";
    return (
      <article
        key={aviso.id}
        className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
          isLido ? "border-[#C8D5E8] bg-[#FAFBFD]" : "border-[#C8D5E8] hover:border-[#1B4F8A]"
        }`}
        aria-label={`Aviso: ${aviso.title}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Info size={18} className="mt-0.5 flex-shrink-0 text-[#1B4F8A]" aria-hidden />
              <div>
                <h3 className="font-bold text-[#1A2332] text-base leading-snug">{aviso.title}</h3>
                <p className="text-xs text-[#1B4F8A] font-semibold mt-0.5">
                  {aviso.sender || "Coordenação Pedagógica"}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                cat === "URGENT"
                  ? "bg-[#FEE2E2] text-[#7B1C1C] border border-[#FCA5A5]"
                  : cat === "IMPORTANT"
                  ? "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                  : cat === "EVENT"
                  ? "bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]"
                  : "bg-[#EEF2F7] text-[#1A2332] border border-[#CBD5E1]"
              }`}
            >
              {cat === "URGENT"
                ? "Urgente"
                : cat === "IMPORTANT"
                ? "Importante"
                : cat === "EVENT"
                ? "Evento"
                : "Geral"}
            </span>
          </div>

          {/* Tags Personalizadas e Padrão */}
          {aviso.tags && aviso.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap ml-7 mb-3">
              {aviso.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    color: tag.color || "#1B4F8A",
                    backgroundColor: tag.bg || (tag.color ? tag.color + "18" : "#EEF2F7"),
                    borderColor: tag.color || "#C8D5E8",
                  }}
                  className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md border"
                >
                  #{tag.label}
                </span>
              ))}
            </div>
          )}

          <p className={`text-sm text-[#4A5568] leading-relaxed ml-7 mb-4 ${!expanded ? "line-clamp-3" : ""}`}>
            {aviso.content}
          </p>

          <div className="flex items-center justify-between gap-3 flex-wrap ml-7 pt-3 border-t border-[#EEF2F7]">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setExpandidos((prev) =>
                    prev.includes(aviso.id) ? prev.filter((i) => i !== aviso.id) : [...prev, aviso.id]
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B4F8A] border border-[#1B4F8A] rounded-lg hover:bg-[#EEF2F7] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] transition-colors"
              >
                <Check size={12} aria-hidden />
                {expanded ? "Recolher Texto" : "Ler Completo"}
              </button>

              {!isLido ? (
                <button
                  onClick={() => handleMarcarComoLido(aviso.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#1B4F8A] hover:bg-[#15407A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4F8A] shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle size={13} aria-hidden />
                  Marcar Como Lido
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#E6F4EA] text-[#0B4622] border border-[#A3CFBB]">
                  <CheckCircle size={13} aria-hidden />
                  ✓ Lido
                </span>
              )}
            </div>
            <time className="text-xs text-[#6B7A8D] font-['JetBrains_Mono']">
              Publicado em: {aviso.date_published}
            </time>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-4xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Avisos e comunicados"
    >
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("dashboard")} />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-4 rounded-xl font-bold text-sm bg-[#F0FFF4] border-2 border-[#1B6B3A] text-[#1B6B3A] shadow-md flex items-center gap-2"
        >
          <CheckCircle size={18} aria-hidden />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabeçalho com Seletor de Dependente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2332] font-['Source_Serif_4']">
            Avisos e Comunicados
          </h1>
          <p className="text-xs text-[#4A5568] mt-1">
            Mural de avisos institucionais e recados pedagógicos dos professores.
          </p>
        </div>

        {dependents.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#C8D5E8] shadow-sm">
            <span className="text-xs font-bold text-[#1A2332]">Estudante:</span>
            <select
              value={currentStudentId}
              onChange={(e) => handleStudentChange(Number(e.target.value))}
              className="text-xs font-bold text-[#1B4F8A] bg-transparent focus:outline-none cursor-pointer"
              aria-label="Selecionar estudante para visualizar avisos"
            >
              {dependents.map((dep) => (
                <option key={dep.student_id} value={dep.student_id}>
                  {dep.name} ({dep.classroom})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Avisos Não Lidos */}
      <section aria-label="Avisos não lidos" className="space-y-4 mb-6">
        <h2 className="text-xs font-bold text-[#1A2332] uppercase tracking-widest flex items-center gap-2">
          <Bell size={14} className="text-[#1B4F8A]" aria-hidden />
          Comunicados Importantes ({naoLidos.length})
        </h2>

        {naoLidos.map((aviso) => renderAvisoCard(aviso, false))}

        {naoLidos.length === 0 && (
          <div role="status" className="bg-white rounded-xl border border-[#C8D5E8] p-8 text-center shadow-sm">
            <CheckCircle size={32} className="text-[#1B6B3A] mx-auto mb-3" aria-hidden />
            <p className="font-bold text-[#1A2332] text-base">Tudo em dia!</p>
            <p className="text-xs text-[#4A5568] mt-1">
              Todos os avisos para <strong>{selectedStudent?.name || "o estudante"}</strong> foram lidos.
            </p>
          </div>
        )}
      </section>

      {/* Avisos Já Lidos — Mantendo a mesma estrutura visual com a etiqueta ✓ Lido */}
      {avisosLidos.length > 0 && (
        <section aria-label="Avisos já lidos" className="space-y-4 mb-6 mt-8">
          <div className="px-1 font-bold text-xs text-[#1A2332] uppercase tracking-wider flex items-center justify-between border-t border-[#CBD5E1] pt-6">
            <span className="flex items-center gap-2">
              <CheckCircle size={15} className="text-[#1B6B3A]" />
              Avisos Já Lidos ({avisosLidos.length})
            </span>
            <span className="text-[#1B6B3A] font-semibold text-xs flex items-center gap-1">
              Confirmados
            </span>
          </div>

          <div className="space-y-4">
            {avisosLidos.map((a) => renderAvisoCard(a, true))}
          </div>
        </section>
      )}
    </main>
  );
}

// ─── Screen 6: Professor (Lançamento Acadêmico) ──────────────────────────────

function ProfessorScreen({
  onNavigate,
  onDataPublished,
}: {
  onNavigate: (s: Screen) => void;
  onDataPublished: () => void;
}) {
  const [classes, setClasses] = useState<ClassroomScope[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>("Matemática");
  const [tipoRegistro, setTipoRegistro] = useState<"notas" | "frequencia" | "avisos">("notas");

  // Novos Seletores de Escopo
  const [selectedAno, setSelectedAno] = useState<string>("2026");
  const [selectedBimester, setSelectedBimester] = useState<string>("1º BM");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("Avaliação 1");

  // Frequência Diária / Mensal e Consolidada
  const [freqBimester, setFreqBimester] = useState<string>("1º BM");
  const [freqSelectedMonthIndex, setFreqSelectedMonthIndex] = useState<number>(1); // 1 = Fev
  const [showScheduleConfigModal, setShowScheduleConfigModal] = useState<boolean>(false);
  const [scheduleConfig, setScheduleConfig] = useState<ClassScheduleConfig>({
    classroomId: 1,
    subject: "Matemática",
    bimester: "1º BM",
    academicYear: 2026,
    startDate: "2026-02-02",
    endDate: "2026-04-30",
    lessonDuration: 50,
    weeklyDays: [1, 3], // 1=Seg, 3=Qua
    dailyLessons: {
      1: { lessonCount: 2, slotsText: "1º e 2º tempos (07:30 - 09:10)", startTime: "07:30", endTime: "09:10" },
      2: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
      3: { lessonCount: 2, slotsText: "1º e 2º tempos (07:30 - 09:10)", startTime: "07:30", endTime: "09:10" },
      4: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
      5: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
      6: { lessonCount: 1, slotsText: "1º tempo (07:30 - 08:20)", startTime: "07:30", endTime: "08:20" },
    },
    exceptions: [
      { id: "exc-1", date: "2026-02-16", type: "NO_CLASS", reason: "Recesso de Carnaval" },
      { id: "exc-2", date: "2026-02-17", type: "NO_CLASS", reason: "Feriado de Carnaval" },
      { id: "exc-3", date: "2026-02-18", type: "NO_CLASS", reason: "Quarta-feira de Cinzas" },
      { id: "exc-4", date: "2026-03-20", type: "NO_CLASS", reason: "Conselho Pedagógico" },
      { id: "exc-5", date: "2026-04-18", type: "EXTRA", reason: "Aula de Reposição de Sábado", lessonCount: 2 },
    ],
  });

  // Modal Exceção Form Fields
  const [newExcDate, setNewExcDate] = useState<string>("2026-03-27");
  const [newExcType, setNewExcType] = useState<"NO_CLASS" | "EXTRA">("NO_CLASS");
  const [newExcReason, setNewExcReason] = useState<string>("Planejamento Pedagógico");
  const [newExcLessons, setNewExcLessons] = useState<number>(2);

  // Registro de Presença Mensal
  const [studentMonthlyAttendance, setStudentMonthlyAttendance] = useState<Record<number, Record<string, string>>>({});

  // Dados carregados do backend
  const [allAssessments, setAllAssessments] = useState<AssessmentDetailItem[]>([]);
  const [studentGradesMap, setStudentGradesMap] = useState<Record<number, Record<number, number | null>>>({});
  const [studentBimesterAverages, setStudentBimesterAverages] = useState<Record<number, Record<string, number | null>>>({});
  const [editScores, setEditScores] = useState<Record<number, string>>({});

  // Frequência (Compatibilidade)
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});
  const [dateFr, setDateFr] = useState("2026-03-25");

  // Avisos e Comunicados
  const [teacherAnnouncements, setTeacherAnnouncements] = useState<AnnouncementItem[]>([]);
  const [annFilterTarget, setAnnFilterTarget] = useState<string>("Todos os Destinatários");
  const [annFilterCategory, setAnnFilterCategory] = useState<string>("Todas as Prioridades");
  const [showAnnModal, setShowAnnModal] = useState<boolean>(false);
  const [isEditingAnn, setIsEditingAnn] = useState<boolean>(false);
  const [editingAnnId, setEditingAnnId] = useState<number | null>(null);

  // Form Fields do Modal de Avisos
  const [annTitle, setAnnTitle] = useState<string>("");
  const [annContent, setAnnContent] = useState<string>("");
  const [annCategory, setAnnCategory] = useState<"GENERAL" | "IMPORTANT" | "URGENT" | "EVENT">("GENERAL");
  const [annSenderRole, setAnnSenderRole] = useState<"PROFESSOR" | "COORDENACAO" | "DIRECAO" | "SECRETARIA">("PROFESSOR");
  const [annSenderName, setAnnSenderName] = useState<string>("Prof. Carlos Mendes");
  const [annTargetType, setAnnTargetType] = useState<"CLASSROOM" | "STUDENT" | "ALL">("CLASSROOM");
  const [annStudentId, setAnnStudentId] = useState<number | null>(null);
  const [annSelectedTags, setAnnSelectedTags] = useState<AnnouncementTag[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [customTagColor, setCustomTagColor] = useState<string>("#1B4F8A");
  const [isSavingAnn, setIsSavingAnn] = useState<boolean>(false);

  // Modais e Feedback
  const [showModal, setShowModal] = useState(false);
  const [showAddAvModal, setShowAddAvModal] = useState(false);
  const [newAvTitle, setNewAvTitle] = useState("Avaliação 2");
  const [newAvType, setNewAvType] = useState("Trabalho");
  const [newAvWeight, setNewAvWeight] = useState("1.0");
  const [newAvDesc, setNewAvDesc] = useState("");
  const [isAddingAv, setIsAddingAv] = useState(false);

  // Estados de Edição da Avaliação Selecionada
  const [showEditAvModal, setShowEditAvModal] = useState(false);
  const [editAvTitle, setEditAvTitle] = useState("");
  const [editAvType, setEditAvType] = useState("Prova");
  const [editAvWeight, setEditAvWeight] = useState("1.0");
  const [editAvDesc, setEditAvDesc] = useState("");
  const [isEditingAv, setIsEditingAv] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Focus Traps Acessíveis para todos os 5 modais (WCAG 2.1.2 / 2.4.3)
  const annModalRef = useModalFocusTrap(showAnnModal, () => setShowAnnModal(false));
  const addAvModalRef = useModalFocusTrap(showAddAvModal, () => setShowAddAvModal(false));
  const editAvModalRef = useModalFocusTrap(showEditAvModal, () => setShowEditAvModal(false));
  const scheduleModalRef = useModalFocusTrap(showScheduleConfigModal, () => setShowScheduleConfigModal(false));
  const confirmModalRef = useModalFocusTrap(showModal, () => setShowModal(false));

  const bimKeyMap: Record<string, string> = {
    "1º BM": "PRIMEIRO",
    "2º BM": "SEGUNDO",
    "3º BM": "TERCEIRO",
    "4º BM": "QUARTO",
  };

  const STANDARD_TAGS: AnnouncementTag[] = [
    { label: "Reunião de Pais", color: "#1B4F8A", bg: "#EEF2F7" },
    { label: "Recuperação Paralela", color: "#D97706", bg: "#FFFBEB" },
    { label: "Plantão de Dúvidas", color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "Tarefa de Casa", color: "#2563EB", bg: "#EFF6FF" },
    { label: "Entrega de Trabalhos", color: "#0D9488", bg: "#F0FDFA" },
    { label: "Comportamento / Elogio", color: "#059669", bg: "#ECFDF5" },
    { label: "Evento Escolar", color: "#6366F1", bg: "#EEF2FF" },
    { label: "Saúde / Vacinação", color: "#10B981", bg: "#ECFDF5" },
  ];

  const COLOR_PALETTE = [
    { label: "Azul TrAcEs", color: "#1B4F8A" },
    { label: "Verde Esmeralda", color: "#059669" },
    { label: "Laranja Âmbar", color: "#D97706" },
    { label: "Roxo Real", color: "#7C3AED" },
    { label: "Vermelho Coral", color: "#DC2626" },
    { label: "Índigo", color: "#4F46E5" },
    { label: "Grafite", color: "#374151" },
  ];

  // Carregar dados gerais (Turmas, Avaliações, Notas e Avisos)
  const reloadData = async () => {
    setLoading(true);
    try {
      const clsData = await tracesApi.getTeacherClasses(1);
      setClasses(clsData);
      const currentCls = clsData.find((c) => c.classroom_id === selectedClassId) || clsData[0];
      if (currentCls && currentCls.classroom_id !== selectedClassId) {
        setSelectedClassId(currentCls.classroom_id);
      }

      // Buscar todas as avaliações da disciplina
      const avList = await tracesApi.getAssessments(selectedSubject, undefined, 2026);
      setAllAssessments(avList);

      // Buscar avisos gerenciados pelo docente
      const annList = await tracesApi.getTeacherAnnouncements(selectedClassId);
      setTeacherAnnouncements(annList);

      // Buscar notas e médias detalhadas de todos os alunos da turma
      const gradesMap: Record<number, Record<number, number | null>> = {};
      const bimAvgMap: Record<number, Record<string, number | null>> = {};
      const initialPres: Record<number, boolean> = {};

      if (currentCls) {
        for (const st of currentCls.students) {
          initialPres[st.student_id] = true;
          gradesMap[st.student_id] = {};
          bimAvgMap[st.student_id] = { "1º BM": null, "2º BM": null, "3º BM": null, "4º BM": null };

          try {
            const det = await tracesApi.getDetailedAssessments(st.student_id, selectedSubject, 2026);
            det.bimesters.forEach((b) => {
              const bimLabel =
                b.bimester === "PRIMEIRO"
                  ? "1º BM"
                  : b.bimester === "SEGUNDO"
                  ? "2º BM"
                  : b.bimester === "TERCEIRO"
                  ? "3º BM"
                  : "4º BM";
              bimAvgMap[st.student_id][bimLabel] = b.average;

              b.assessments.forEach((av) => {
                gradesMap[st.student_id][av.assessment_id] = av.score;
              });
            });
          } catch {
            // fallback
          }
        }
      }

      setStudentGradesMap(gradesMap);
      setStudentBimesterAverages(bimAvgMap);
      setPresencas(initialPres);
    } catch (err) {
      console.warn("Erro ao recarregar dados do docente:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mainRef.current?.focus();
    reloadData();
  }, [selectedSubject, selectedClassId]);

  const currentClass = classes.find((c) => c.classroom_id === selectedClassId) || classes[0];
  const students = currentClass?.students || [];

  // Filtrar avaliações para o bimestre selecionado
  const currentBimEnum = bimKeyMap[selectedBimester] || "PRIMEIRO";
  const bimesterAssessments = allAssessments.filter(
    (a) => a.bimester === currentBimEnum
  );

  // Opções para o Seletor de Avaliações
  const assessmentOptions =
    selectedBimester === "Consolidado"
      ? ["Todas"]
      : bimesterAssessments.length > 0
      ? [...bimesterAssessments.map((a) => a.seq_title || a.title), "Todas"]
      : ["Todas"];

  // Ajustar seleção de avaliação se a atual for inválida
  useEffect(() => {
    if (selectedBimester === "Consolidado") {
      setSelectedAssessment("Todas");
    } else if (!assessmentOptions.includes(selectedAssessment)) {
      setSelectedAssessment(assessmentOptions[0] || "Todas");
    }
  }, [selectedBimester, allAssessments]);

  // Atualizar editScores quando mudar a avaliação selecionada
  const activeAssessmentObj = bimesterAssessments.find(
    (a) => (a.seq_title || a.title) === selectedAssessment
  );

  useEffect(() => {
    if (activeAssessmentObj) {
      const initialEdits: Record<number, string> = {};
      students.forEach((st) => {
        const score = studentGradesMap[st.student_id]?.[activeAssessmentObj.assessment_id];
        initialEdits[st.student_id] = score !== null && score !== undefined ? score.toString() : "";
      });
      setEditScores(initialEdits);
    }
  }, [selectedAssessment, selectedBimester, studentGradesMap, selectedSubject]);

  const handleEditScoreChange = (studentId: number, val: string) => {
    setEditScores((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  const notaValida = (val: string): boolean | null => {
    if (!val) return null;
    const n = parseFloat(val);
    return !isNaN(n) && n >= 0 && n <= 10.0;
  };

  // Abrir Modal de Nova Avaliação para a Turma
  const handleOpenAddAssessmentModal = () => {
    const nextNum = bimesterAssessments.length + 1;
    setNewAvTitle(`Avaliação ${nextNum}`);
    setNewAvType("Trabalho");
    setNewAvWeight("1.0");
    setNewAvDesc("");
    setShowAddAvModal(true);
  };

  // Salvar Nova Avaliação no Backend
  const handleSaveNewAssessmentForClass = async () => {
    setIsAddingAv(true);
    try {
      const res = await tracesApi.addAssessment({
        subject: selectedSubject,
        bimester: currentBimEnum,
        academic_year: 2026,
        title: newAvTitle || `Avaliação ${bimesterAssessments.length + 1}`,
        assessment_type: newAvType === "Prova" ? "PROVA" : newAvType === "Atividade Prática" ? "ATIVIDADE_PRATICA" : "TRABALHO",
        weight: parseFloat(newAvWeight) || 1.0,
        description: newAvDesc || `${newAvTitle} de ${selectedSubject}`,
        graded_by: "Prof. Carlos Mendes",
      });

      setShowAddAvModal(false);
      setToastMessage(`✅ ${res.title || "Nova avaliação"} criada para a turma no ${selectedBimester}! Digite as notas abaixo.`);
      await reloadData();
      setSelectedAssessment(res.title || res.seq_title || `Avaliação ${bimesterAssessments.length + 1}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`❌ Erro ao criar avaliação: ${err.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsAddingAv(false);
    }
  };

  // Abrir Modal de Edição da Avaliação Ativa
  const handleOpenEditAssessmentModal = () => {
    if (!activeAssessmentObj) return;
    setEditAvTitle(activeAssessmentObj.seq_title || activeAssessmentObj.title || "Avaliação 1");
    setEditAvType(
      activeAssessmentObj.type === "PROVA"
        ? "Prova"
        : activeAssessmentObj.type === "ATIVIDADE_PRATICA"
        ? "Atividade Prática"
        : activeAssessmentObj.type === "SEMINARIO"
        ? "Seminário"
        : "Trabalho"
    );
    setEditAvWeight(activeAssessmentObj.weight.toString());
    setEditAvDesc(activeAssessmentObj.description || "");
    setShowEditAvModal(true);
  };

  // Salvar Alterações da Avaliação no Backend
  const handleSaveEditAssessment = async () => {
    if (!activeAssessmentObj) return;
    setIsEditingAv(true);
    try {
      const typeFormatted =
        editAvType === "Prova"
          ? "PROVA"
          : editAvType === "Atividade Prática"
          ? "ATIVIDADE_PRATICA"
          : editAvType === "Seminário"
          ? "SEMINARIO"
          : "TRABALHO";

      await tracesApi.updateAssessment(activeAssessmentObj.assessment_id, {
        title: editAvTitle || activeAssessmentObj.title,
        assessment_type: typeFormatted,
        weight: parseFloat(editAvWeight) || 1.0,
        description: editAvDesc,
      });

      setShowEditAvModal(false);
      setToastMessage(`✅ ${selectedAssessment} atualizada com sucesso no banco de dados!`);
      await reloadData();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`❌ Erro ao atualizar avaliação: ${err.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsEditingAv(false);
    }
  };

  // Handlers para Criação / Edição de Avisos
  const handleOpenCreateAnnModal = () => {
    setIsEditingAnn(false);
    setEditingAnnId(null);
    setAnnTitle("");
    setAnnContent("");
    setAnnCategory("GENERAL");
    setAnnSenderRole("PROFESSOR");
    setAnnSenderName("Prof. Carlos Mendes");
    setAnnTargetType("CLASSROOM");
    setAnnStudentId(students[0]?.student_id || null);
    setAnnSelectedTags([]);
    setCustomTagInput("");
    setCustomTagColor("#1B4F8A");
    setShowAnnModal(true);
  };

  const handleOpenEditAnnModal = (ann: AnnouncementItem) => {
    setIsEditingAnn(true);
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnCategory(ann.category || "GENERAL");
    setAnnSenderRole(ann.sender_role || "PROFESSOR");
    setAnnSenderName(ann.sender_name || "Prof. Carlos Mendes");
    setAnnTargetType(ann.target_type || "CLASSROOM");
    setAnnStudentId(ann.student_id || students[0]?.student_id || null);
    setAnnSelectedTags(ann.tags || []);
    setCustomTagInput("");
    setCustomTagColor("#1B4F8A");
    setShowAnnModal(true);
  };

  const handleToggleTag = (tag: AnnouncementTag) => {
    if (annSelectedTags.some((t) => t.label.toLowerCase() === tag.label.toLowerCase())) {
      setAnnSelectedTags((prev) => prev.filter((t) => t.label.toLowerCase() !== tag.label.toLowerCase()));
    } else {
      setAnnSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (annSelectedTags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
      setCustomTagInput("");
      return;
    }
    const newTag: AnnouncementTag = {
      label: trimmed,
      color: customTagColor,
      bg: customTagColor + "18",
    };
    setAnnSelectedTags((prev) => [...prev, newTag]);
    setCustomTagInput("");
  };

  const handleRemoveTag = (labelToRemove: string) => {
    setAnnSelectedTags((prev) => prev.filter((t) => t.label !== labelToRemove));
  };

  const handleSaveAnnouncement = async () => {
    if (!annTitle.trim()) {
      setToastMessage("❌ O título do aviso é obrigatório.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (!annContent.trim()) {
      setToastMessage("❌ O conteúdo do aviso é obrigatório.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setIsSavingAnn(true);
    try {
      const payload: CreateAnnouncementPayload = {
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        sender_role: annSenderRole,
        sender_name: annSenderName,
        target_type: annTargetType,
        classroom_id: annTargetType === "ALL" ? null : selectedClassId,
        student_id: annTargetType === "STUDENT" ? annStudentId : null,
        subject: selectedSubject,
        tags: annSelectedTags,
      };

      if (isEditingAnn && editingAnnId) {
        await tracesApi.updateAnnouncement(editingAnnId, payload);
        setToastMessage("✅ Aviso atualizado com sucesso no mural!");
      } else {
        await tracesApi.createAnnouncement(payload);
        setToastMessage("✅ Novo aviso publicado com sucesso no mural escolar!");
      }

      setShowAnnModal(false);
      setTipoRegistro("avisos");
      await reloadData();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`❌ Erro ao salvar aviso: ${err.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSavingAnn(false);
    }
  };

  // Handlers para o Modal de Horários e Vigência
  const handleAddException = () => {
    if (!newExcDate) return;
    const newExc: ScheduleException = {
      id: `exc-${Date.now()}`,
      date: newExcDate,
      type: newExcType,
      reason: newExcReason.trim() || (newExcType === "NO_CLASS" ? "Feriado / Recesso" : "Aula Extra"),
      lessonCount: newExcType === "EXTRA" ? newExcLessons : undefined,
    };
    setScheduleConfig((prev) => ({
      ...prev,
      exceptions: [...prev.exceptions, newExc],
    }));
    setToastMessage(`✅ Exceção (${newExc.reason}) cadastrada para ${newExcDate}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveException = (id: string) => {
    setScheduleConfig((prev) => ({
      ...prev,
      exceptions: prev.exceptions.filter((e) => e.id !== id),
    }));
  };

  const handleToggleWeeklyDay = (dayNum: number) => {
    setScheduleConfig((prev) => {
      const exists = prev.weeklyDays.includes(dayNum);
      const updatedDays = exists
        ? prev.weeklyDays.filter((d) => d !== dayNum)
        : [...prev.weeklyDays, dayNum].sort();
      return { ...prev, weeklyDays: updatedDays };
    });
  };

  // Mapa de Meses por Bimestre
  const bimesterMonthsMap: Record<string, { index: number; name: string }[]> = {
    "1º BM": [
      { index: 1, name: "Fevereiro" },
      { index: 2, name: "Março" },
      { index: 3, name: "Abril" },
    ],
    "2º BM": [
      { index: 4, name: "Maio" },
      { index: 5, name: "Junho" },
      { index: 6, name: "Julho" },
    ],
    "3º BM": [
      { index: 7, name: "Agosto" },
      { index: 8, name: "Setembro" },
      { index: 9, name: "Outubro" },
    ],
    "4º BM": [
      { index: 9, name: "Outubro" },
      { index: 10, name: "Novembro" },
      { index: 11, name: "Dezembro" },
    ],
  };

  // Ajustar mês selecionado quando o bimestre de frequência mudar
  useEffect(() => {
    if (freqBimester !== "Consolidado") {
      const months = bimesterMonthsMap[freqBimester];
      if (months && months.length > 0) {
        if (!months.some((m) => m.index === freqSelectedMonthIndex)) {
          setFreqSelectedMonthIndex(months[0].index);
        }
      }
    }
  }, [freqBimester]);

  const currentMonthObj = (bimesterMonthsMap[freqBimester] || bimesterMonthsMap["1º BM"]).find(
    (m) => m.index === freqSelectedMonthIndex
  ) || (bimesterMonthsMap[freqBimester] || bimesterMonthsMap["1º BM"])[0];

  const yearNum = parseInt(selectedAno, 10) || 2026;
  const monthIdx = currentMonthObj?.index ?? 1;

  // Dias letivos calculados conforme a grade horária e vigência
  const activeClassDays = React.useMemo(() => {
    const daysInMonth = new Date(yearNum, monthIdx + 1, 0).getDate();
    const days: {
      dateStr: string;
      dayNumber: number;
      weekdayShort: string;
      lessonCount: number;
      slotsText: string;
      isExtra?: boolean;
      extraReason?: string;
    }[] = [];

    const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(yearNum, monthIdx, d);
      const dayOfWeek = dateObj.getDay();
      const dateStr = `${yearNum}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      // Verificar se é exceção NO_CLASS
      const isNoClass = scheduleConfig.exceptions.some(
        (e) => e.date === dateStr && e.type === "NO_CLASS"
      );
      if (isNoClass) continue;

      // Verificar se é exceção EXTRA
      const extra = scheduleConfig.exceptions.find(
        (e) => e.date === dateStr && e.type === "EXTRA"
      );
      if (extra) {
        days.push({
          dateStr,
          dayNumber: d,
          weekdayShort: weekdayNames[dayOfWeek],
          lessonCount: extra.lessonCount || 2,
          slotsText: `Aula Extra (${extra.lessonCount || 2}T)`,
          isExtra: true,
          extraReason: extra.reason,
        });
        continue;
      }

      // Verificar se o dia da semana tem aula regular
      if (scheduleConfig.weeklyDays.includes(dayOfWeek)) {
        const dConfig = scheduleConfig.dailyLessons[dayOfWeek] || {
          lessonCount: 2,
          slotsText: "1º e 2º tempos (07:30 - 09:10)",
        };
        days.push({
          dateStr,
          dayNumber: d,
          weekdayShort: weekdayNames[dayOfWeek],
          lessonCount: dConfig.lessonCount,
          slotsText: dConfig.slotsText,
        });
      }
    }

    return days;
  }, [yearNum, monthIdx, scheduleConfig]);

  // Carregar presença publicada no localStorage ao mudar turma, ano ou mês no diário docente
  useEffect(() => {
    try {
      const rawPublished = localStorage.getItem("traces_published_attendance");
      if (rawPublished) {
        const pubMap = JSON.parse(rawPublished);
        const calMonth = String(monthIdx + 1).padStart(2, "0");
        const monthKey = `${yearNum}-${calMonth}`;
        const loaded: Record<number, Record<string, string>> = {};

        students.forEach((st) => {
          if (pubMap[st.student_id]?.[monthKey]) {
            loaded[st.student_id] = { ...pubMap[st.student_id][monthKey] };
          }
        });

        if (Object.keys(loaded).length > 0) {
          setStudentMonthlyAttendance((prev) => ({
            ...prev,
            ...loaded,
          }));
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar frequência salva:", err);
    }
  }, [selectedClassId, yearNum, monthIdx, students]);

  // Obter código de presença do aluno para um dia (3º e 4º bimestres vêm em branco por padrão)
  const getAttendanceCode = (studentId: number, day: { dateStr: string; lessonCount: number }) => {
    const custom = studentMonthlyAttendance[studentId]?.[day.dateStr];
    if (custom !== undefined) return custom;
    if (freqBimester === "3º BM" || freqBimester === "4º BM") return "";
    return `${day.lessonCount}P`;
  };

  // Alternar ciclicamente a presença no dia (incluindo a opção de campo em branco "")
  const handleCycleAttendance = (studentId: number, day: { dateStr: string; lessonCount: number }) => {
    const current = getAttendanceCode(studentId, day);
    let nextCode = "";

    if (day.lessonCount === 1) {
      if (current === "" || current === undefined) nextCode = "1P";
      else if (current === "1P") nextCode = "1F";
      else if (current === "1F") nextCode = "1FJ";
      else nextCode = ""; // Deixar em branco
    } else if (day.lessonCount === 2) {
      if (current === "" || current === undefined) nextCode = "2P";
      else if (current === "2P") nextCode = "1P 1F";
      else if (current === "1P 1F") nextCode = "2F";
      else if (current === "2F") nextCode = "2FJ";
      else nextCode = ""; // Deixar em branco
    } else {
      if (current === "" || current === undefined) nextCode = `${day.lessonCount}P`;
      else if (current === `${day.lessonCount}P`) nextCode = `1P ${day.lessonCount - 1}F`;
      else if (current === `1P ${day.lessonCount - 1}F`) nextCode = `${day.lessonCount}F`;
      else if (current === `${day.lessonCount}F`) nextCode = `${day.lessonCount}FJ`;
      else nextCode = ""; // Deixar em branco
    }

    setStudentMonthlyAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [day.dateStr]: nextCode,
      },
    }));
  };

  // Verificar se todos os alunos possuem presença total no dia
  const isDayFullPresence = (day: { dateStr: string; lessonCount: number }) => {
    if (students.length === 0) return false;
    return students.every((st) => {
      const code = getAttendanceCode(st.student_id, day);
      return code === `${day.lessonCount}P`;
    });
  };

  // Alternar entre aplicar presença total e limpar presença (deixar em branco "") para todos os alunos no dia
  const handleToggleDayPresence = (day: { dateStr: string; dayNumber: number; weekdayShort: string; lessonCount: number }) => {
    const isFull = isDayFullPresence(day);
    if (isFull) {
      // Limpar presença em todos os alunos (deixar em branco "")
      setStudentMonthlyAttendance((prev) => {
        const updated = { ...prev };
        students.forEach((st) => {
          if (!updated[st.student_id]) updated[st.student_id] = {};
          updated[st.student_id][day.dateStr] = "";
        });
        return updated;
      });
      setToastMessage(`🗑️ Presença limpa (campo em branco) para todos os alunos no dia ${day.dayNumber} (${day.weekdayShort})!`);
    } else {
      // Aplicar presença total (xP)
      const code = `${day.lessonCount}P`;
      setStudentMonthlyAttendance((prev) => {
        const updated = { ...prev };
        students.forEach((st) => {
          if (!updated[st.student_id]) updated[st.student_id] = {};
          updated[st.student_id][day.dateStr] = code;
        });
        return updated;
      });
      setToastMessage(`✅ Presença total (${code}) aplicada para todos os alunos no dia ${day.dayNumber} (${day.weekdayShort})!`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Totalizadores do Mês para um Aluno
  const getStudentMonthlyStats = (studentId: number) => {
    let totalLessons = 0;
    let presences = 0;
    let absences = 0;
    let justifiedAbsences = 0;

    activeClassDays.forEach((day) => {
      const code = getAttendanceCode(studentId, day);
      if (!code) return; // Se em branco, não contabiliza como aula lançada

      totalLessons += day.lessonCount;
      if (code === "2P") {
        presences += 2;
      } else if (code === "1P") {
        presences += 1;
      } else if (code === "1P 1F") {
        presences += 1;
        absences += 1;
      } else if (code === "2F") {
        absences += 2;
      } else if (code === "1F") {
        absences += 1;
      } else if (code === "2FJ") {
        justifiedAbsences += 2;
        presences += 2;
      } else if (code === "1FJ") {
        justifiedAbsences += 1;
        presences += 1;
      } else if (code.endsWith("P")) {
        presences += day.lessonCount;
      } else if (code.endsWith("FJ")) {
        justifiedAbsences += day.lessonCount;
        presences += day.lessonCount;
      } else {
        absences += day.lessonCount;
      }
    });

    const rate = totalLessons > 0 ? Math.round((presences / totalLessons) * 100) : 100;
    return { totalLessons, presences, absences, justifiedAbsences, rate };
  };

  // Dados consolidados anuais dos 4 bimestres (3º e 4º bimestres sem registro por enquanto)
  const consolidatedAttendanceData: Record<number, {
    b1: { classes: number; absences: number; rate: number };
    b2: { classes: number; absences: number; rate: number };
    b3: { classes: number; absences: number; rate: number | null };
    b4: { classes: number; absences: number; rate: number | null };
  }> = {
    1: {
      b1: { classes: 48, absences: 2, rate: 96 },
      b2: { classes: 50, absences: 4, rate: 92 },
      b3: { classes: 0, absences: 0, rate: null },
      b4: { classes: 0, absences: 0, rate: null },
    },
    2: {
      b1: { classes: 48, absences: 0, rate: 100 },
      b2: { classes: 50, absences: 2, rate: 96 },
      b3: { classes: 0, absences: 0, rate: null },
      b4: { classes: 0, absences: 0, rate: null },
    },
    3: {
      b1: { classes: 48, absences: 8, rate: 83 },
      b2: { classes: 50, absences: 11, rate: 78 },
      b3: { classes: 0, absences: 0, rate: null },
      b4: { classes: 0, absences: 0, rate: null },
    },
  };

  // Cálculo dos Alertas Pedagógicos de Frequência do Docente
  const attendanceAlerts = React.useMemo(() => {
    const alerts: {
      id: string;
      type: "PENDING_MONTH" | "EXCESSIVE_ABSENCES" | "CRITICAL_RATE";
      title: string;
      description: string;
      severity: "warning" | "danger" | "info";
    }[] = [];

    // 1. Lembrete de Meses Vigentes/Passados sem Registro
    const rawPublished = localStorage.getItem("traces_published_attendance");
    const pubMap = rawPublished ? JSON.parse(rawPublished) : {};
    const monthsToCheck = [
      { name: "Fevereiro", idx: 1, key: `${yearNum}-02` },
      { name: "Março", idx: 2, key: `${yearNum}-03` },
    ];

    monthsToCheck.forEach((m) => {
      const hasRecords = students.some(
        (st) => pubMap[st.student_id]?.[m.key] && Object.keys(pubMap[st.student_id][m.key]).length > 0
      );
      if (!hasRecords && m.idx <= monthIdx) {
        alerts.push({
          id: `pending-${m.name}`,
          type: "PENDING_MONTH",
          title: `Lembrete de Chamada: ${m.name}/${yearNum}`,
          description: `A chamada do mês de ${m.name} ainda não foi concluída e publicada para a disciplina de ${selectedSubject}.`,
          severity: "warning",
        });
      }
    });

    // 2. Alunos com mais de 10 faltas ou < 40% de frequência projetada no mês
    if (activeClassDays.length > 0) {
      students.forEach((st) => {
        const stats = getStudentMonthlyStats(st.student_id);
        const totalMonthLessons = stats.totalLessons;

        // Faltas excessivas (> 10 faltas no mês)
        if (stats.absences > 10) {
          alerts.push({
            id: `absences-${st.student_id}`,
            type: "EXCESSIVE_ABSENCES",
            title: `Alerta de Infrequência: ${st.name}`,
            description: `${st.name} acumula ${stats.absences} faltas em ${currentMonthObj?.name} (ultrapassou o limite de atenção de 10 faltas no mês).`,
            severity: "danger",
          });
        }

        // Projeção crítica (< 40% de frequência no mês, considerando presença nas aulas futuras)
        if (totalMonthLessons > 0) {
          // Aulas que ainda não aconteceram consideradas com presença
          const futureLessons = 0; // Se houver aulas futuras, somam como presença
          const projectedRate = Math.round(((stats.presences + futureLessons) / totalMonthLessons) * 100);

          if (projectedRate < 40 && stats.absences > 0) {
            alerts.push({
              id: `rate-${st.student_id}`,
              type: "CRITICAL_RATE",
              title: `Risco Crítico de Infrequência: ${st.name}`,
              description: `Projeção mensal de assiduidade de apenas ${projectedRate}% em ${currentMonthObj?.name} (abaixo do patamar crítico de 40%).`,
              severity: "danger",
            });
          }
        }
      });
    }

    return alerts;
  }, [students, activeClassDays, selectedSubject, yearNum, monthIdx, currentMonthObj, studentMonthlyAttendance]);

  // Publicar Notas ou Chamada
  const handlePublicarConfirmado = async () => {
    setShowModal(false);
    setIsSubmitting(true);

    try {
      if (tipoRegistro === "notas") {
        if (!activeAssessmentObj) {
          throw new Error("Nenhuma avaliação selecionada para salvar. Selecione uma avaliação específica.");
        }

        const gradesList = students
          .filter((s) => {
            const val = editScores[s.student_id];
            return val !== undefined && val !== "" && notaValida(val);
          })
          .map((s) => ({
            student_id: s.student_id,
            score: parseFloat(editScores[s.student_id]),
          }));

        if (gradesList.length === 0) {
          throw new Error("Nenhuma nota válida digitada (entre 0.0 e 10.0).");
        }

        const res = await tracesApi.saveBulkGrades({
          assessment_id: activeAssessmentObj.assessment_id,
          subject: selectedSubject,
          bimester: currentBimEnum,
          academic_year: yearNum,
          graded_by: "Prof. Carlos Mendes",
          grades: gradesList,
        });

        setToastMessage(`✅ ${res.records_created || gradesList.length} notas salvas e gravadas no banco SQLite para a ${selectedAssessment}!`);
      } else {
        // Salvar presença diária de cada dia letivo do mês no backend
        for (const day of activeClassDays) {
          const recordsPayload = students.map((s) => {
            const code = getAttendanceCode(s.student_id, day);
            const isPresent = code.endsWith("P") && !code.includes("1F");
            const isJustified = code.endsWith("FJ");
            return {
              student_id: s.student_id,
              is_present: isPresent || isJustified,
              justification: isJustified ? "Atestado médico" : undefined,
            };
          });

          try {
            await tracesApi.saveBulkAttendance({
              date: day.dateStr,
              subject: selectedSubject,
              classroom_id: selectedClassId,
              records: recordsPayload,
            });
          } catch (apiErr) {
            console.warn(`Aviso na gravação da data ${day.dateStr}:`, apiErr);
          }
        }

        // Persistir no localStorage para sincronização imediata com a área dos pais
        try {
          const rawPublished = localStorage.getItem("traces_published_attendance");
          const pubMap = rawPublished ? JSON.parse(rawPublished) : {};
          const calMonth = String(monthIdx + 1).padStart(2, "0");
          const monthKey = `${yearNum}-${calMonth}`;

          students.forEach((st) => {
            if (!pubMap[st.student_id]) pubMap[st.student_id] = {};
            if (!pubMap[st.student_id][monthKey]) pubMap[st.student_id][monthKey] = {};
            activeClassDays.forEach((day) => {
              pubMap[st.student_id][monthKey][day.dateStr] = getAttendanceCode(st.student_id, day);
            });
          });

          localStorage.setItem("traces_published_attendance", JSON.stringify(pubMap));
          localStorage.setItem("traces_schedule_config", JSON.stringify(scheduleConfig));
        } catch (storageErr) {
          console.warn("Aviso ao salvar localmente:", storageErr);
        }

        setToastMessage(`✅ Chamada Mensal de ${currentMonthObj?.name} (${activeClassDays.length} dias letivos) salva e sincronizada com a área dos pais!`);
      }

      await reloadData();
      onDataPublished();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage(`❌ Erro ao salvar no banco de dados: ${err.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPresentes = Object.values(presencas).filter(Boolean).length;
  const totalFaltas = students.length - totalPresentes;

  // Filtros e Ordenação da Tabela de Avisos do Docente (1º mais recente, 2º alfabética)
  const filteredTeacherAnnouncements = teacherAnnouncements
    .filter((ann) => {
      if (annFilterTarget === "Toda a Turma" && ann.target_type !== "CLASSROOM") return false;
      if (annFilterTarget.startsWith("Aluno: ")) {
        const stName = annFilterTarget.replace("Aluno: ", "");
        if (ann.student_name !== stName && !ann.title.includes(stName)) return false;
      }
      if (annFilterCategory === "Urgente" && ann.category !== "URGENT") return false;
      if (annFilterCategory === "Importante" && ann.category !== "IMPORTANT") return false;
      if (annFilterCategory === "Geral" && ann.category !== "GENERAL") return false;
      if (annFilterCategory === "Evento" && ann.category !== "EVENT") return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = a.date_published || "";
      const dateB = b.date_published || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return (a.title || "").localeCompare(b.title || "", "pt-BR", { sensitivity: "base" });
    });

  // Determinar se está no modo de edição de notas (somente na avaliação específica)
  const isSpecificAssessmentMode =
    tipoRegistro === "notas" &&
    selectedBimester !== "Consolidado" &&
    selectedAssessment !== "Todas" &&
    activeAssessmentObj !== undefined;

  const isBimesterAllMode =
    tipoRegistro === "notas" &&
    selectedBimester !== "Consolidado" &&
    selectedAssessment === "Todas";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      ref={mainRef}
      className="max-w-6xl mx-auto w-full px-6 py-8 outline-none"
      aria-label="Painel do professor"
    >
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("dashboard")} />

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-4 rounded-xl font-bold text-sm bg-[#F0FFF4] border-2 border-[#1B6B3A] text-[#1B6B3A] shadow-md flex items-center gap-2"
        >
          <CheckCircle size={18} aria-hidden />
          <span>{toastMessage}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#1A2332] mb-6 font-['Source_Serif_4']">
        Área do Docente — Lançamento Acadêmico
      </h1>

      {/* Seleção de Escopo e Tipo de Registro */}
      <section aria-label="Seletores de escopo" className="bg-white rounded-xl border border-[#C8D5E8] p-5 mb-5 shadow-sm">
        <h2 className="text-xs font-bold text-[#1A2332] uppercase tracking-widest mb-4">
          Seleção de Escopo e Tipo de Registro
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <SelectField
            id="prof-turma"
            label="Selecionar Turma"
            value={currentClass?.name || "9º Ano A - Manhã"}
            onChange={(v) => {
              const matched = classes.find((c) => c.name === v);
              if (matched) setSelectedClassId(matched.classroom_id);
            }}
            options={classes.map((c) => c.name)}
          />
          <SelectField
            id="prof-disc"
            label="Selecionar Disciplina"
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={currentClass?.subjects || ["Matemática", "Português"]}
          />
          <SelectField
            id="prof-tipo"
            label="Tipo de Registro"
            value={
              tipoRegistro === "notas"
                ? "Notas e Avaliações"
                : tipoRegistro === "frequencia"
                ? "Frequência Diária"
                : "Avisos e Comunicados"
            }
            onChange={(v) => {
              if (v.includes("Notas")) setTipoRegistro("notas");
              else if (v.includes("Frequência")) setTipoRegistro("frequencia");
              else setTipoRegistro("avisos");
            }}
            options={["Notas e Avaliações", "Frequência Diária", "Avisos e Comunicados"]}
          />

          {/* Seletores Específicos para Notas */}
          {tipoRegistro === "notas" && (
            <>
              <SelectField
                id="prof-bimestre"
                label="Bimestre / Visão"
                value={selectedBimester}
                onChange={setSelectedBimester}
                options={["1º BM", "2º BM", "3º BM", "4º BM", "Consolidado"]}
              />
              <SelectField
                id="prof-avaliacao"
                label="Avaliação"
                value={selectedAssessment}
                onChange={setSelectedAssessment}
                options={assessmentOptions}
              />
              <SelectField
                id="prof-ano-notas"
                label="Ano"
                value={selectedAno}
                onChange={setSelectedAno}
                options={["2026", "2025", "2024"]}
              />
            </>
          )}

          {/* Seletores Específicos para Frequência */}
          {tipoRegistro === "frequencia" && (
            <>
              <SelectField
                id="prof-bimestre-freq"
                label="Bimestre / Visão"
                value={freqBimester}
                onChange={setFreqBimester}
                options={["1º BM", "2º BM", "3º BM", "4º BM", "Consolidado"]}
              />
              <SelectField
                id="prof-ano-freq"
                label="Ano"
                value={selectedAno}
                onChange={setSelectedAno}
                options={["2026", "2025", "2024"]}
              />
            </>
          )}

          {/* Seletores Específicos para Avisos */}
          {tipoRegistro === "avisos" && (
            <>
              <SelectField
                id="prof-filtro-dest"
                label="Filtrar Destinatário"
                value={annFilterTarget}
                onChange={setAnnFilterTarget}
                options={[
                  "Todos os Destinatários",
                  "Toda a Turma",
                  ...students.map((s) => `Aluno: ${s.name}`),
                ]}
              />
              <SelectField
                id="prof-filtro-prio"
                label="Filtrar Prioridade"
                value={annFilterCategory}
                onChange={setAnnFilterCategory}
                options={["Todas as Prioridades", "Urgente", "Importante", "Geral", "Evento"]}
              />
              <SelectField
                id="prof-ano-avisos"
                label="Ano"
                value={selectedAno}
                onChange={setSelectedAno}
                options={["2026", "2025", "2024"]}
              />
            </>
          )}
        </div>
      </section>

      {/* 1. GRID DE ENTRADA / VISUALIZAÇÃO DE NOTAS */}
      {tipoRegistro === "notas" && (
        <section aria-label="Tabela de lançamento de notas" className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-5 overflow-hidden">
          {/* Cabeçalho da Seção */}
          <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A2332]">
                {isSpecificAssessmentMode
                  ? `Lançamento de Notas: ${selectedAssessment} — ${selectedBimester} (${selectedSubject})`
                  : isBimesterAllMode
                  ? `Todas as Avaliações — ${selectedBimester} (${selectedSubject})`
                  : `Consolidado Anual dos 4 Bimestres — ${selectedSubject}`}
              </h2>
              <p className="text-xs text-[#4A5568] mt-0.5">
                Turma: <strong>{currentClass?.name}</strong> · Ano Letivo: <strong>{selectedAno}</strong>
              </p>
            </div>

            {/* Botões de Gestão da Avaliação */}
            <div className="flex items-center gap-2 flex-wrap">
              {isSpecificAssessmentMode && (
                <button
                  onClick={handleOpenEditAssessmentModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EEF2F7] text-[#1B4F8A] border-2 border-[#1B4F8A] text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  aria-label={`Editar dados da ${selectedAssessment}`}
                >
                  <Edit size={14} aria-hidden />
                  Editar Avaliação
                </button>
              )}

              {selectedBimester !== "Consolidado" && (
                <button
                  onClick={handleOpenAddAssessmentModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1B4F8A] hover:bg-[#15407A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  aria-label={`Adicionar nova avaliação para toda a turma no ${selectedBimester}`}
                >
                  <Plus size={14} aria-hidden />
                  + Nova Avaliação
                </button>
              )}
            </div>
          </div>

          {/* TABELA DE NOTAS */}
          <div className="overflow-x-auto">
            {isSpecificAssessmentMode ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider">Estudante</th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Matrícula</th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Tipo / Descrição</th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Peso</th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Nota no Sistema</th>
                    <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider text-center w-36">
                      Digitar Nota (0.0 - 10.0)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {students.map((student) => {
                    const savedScore = studentGradesMap[student.student_id]?.[activeAssessmentObj?.assessment_id || 0];
                    const currentEdit = editScores[student.student_id] ?? "";
                    const isValid = notaValida(currentEdit);

                    return (
                      <tr key={student.student_id} className="hover:bg-[#FAFBFD]">
                        <td className="px-5 py-3.5 font-medium text-[#1A2332]">
                          <div className="font-bold text-sm">{student.name}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] text-xs text-[#4A5568]">
                          {student.registration}
                        </td>
                        <td className="px-4 py-3.5 text-center text-xs text-[#4A5568]">
                          <span className="font-semibold text-[#1A2332]">
                            {activeAssessmentObj?.type === "PROVA"
                              ? "Prova"
                              : activeAssessmentObj?.type === "ATIVIDADE_PRATICA"
                              ? "Atividade Prática"
                              : "Trabalho"}
                          </span>
                          {activeAssessmentObj?.description && (
                            <span className="block text-[11px] text-[#6B7A8D] mt-0.5">
                              {activeAssessmentObj.description}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-xs text-[#1A2332]">
                          {activeAssessmentObj?.weight ? `Peso ${activeAssessmentObj.weight.toFixed(1)}` : "Peso 1.0"}
                        </td>
                        <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1B4F8A]">
                          {savedScore !== null && savedScore !== undefined ? savedScore.toFixed(1) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={currentEdit}
                            onChange={(e) => handleEditScoreChange(student.student_id, e.target.value)}
                            placeholder={savedScore !== null && savedScore !== undefined ? savedScore.toFixed(1) : "0.0"}
                            className={`w-24 px-3 py-1.5 border-2 rounded-lg text-center font-['JetBrains_Mono'] font-bold text-sm transition-all focus:outline-none focus:ring-2 ${
                              isValid === false
                                ? "border-[#C0392B] bg-[#FFF5F5] focus:ring-[#C0392B]"
                                : currentEdit !== ""
                                ? "border-[#1B4F8A] bg-white focus:ring-[#1B4F8A]"
                                : "border-[#C8D5E8] bg-[#FAFBFD] focus:ring-[#1B4F8A]"
                            }`}
                            aria-label={`Nota de ${student.name}`}
                            aria-invalid={isValid === false}
                            aria-errormessage={isValid === false ? `error-score-${student.student_id}` : undefined}
                          />
                          {isValid === false && (
                            <span id={`error-score-${student.student_id}`} className="sr-only" role="alert">
                              Nota inválida para {student.name}. Insira um valor entre 0.0 e 10.0.
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : isBimesterAllMode ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider">Estudante</th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Matrícula</th>
                    {bimesterAssessments.map((av) => (
                      <th
                        key={av.assessment_id}
                        scope="col"
                        className="px-4 py-3.5 font-bold uppercase tracking-wider text-center"
                      >
                        {av.seq_title || av.title}
                        <span className="block text-[10px] font-normal text-[#6B7A8D]">
                          (Peso: {av.weight ? av.weight.toFixed(1) : "1.0"})
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center bg-[#F0F4F8] text-[#1B4F8A]">
                      Média Ponderada
                    </th>
                    <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {students.map((student) => {
                    const avg = studentBimesterAverages[student.student_id]?.[selectedBimester];
                    return (
                      <tr key={student.student_id} className="hover:bg-[#FAFBFD]">
                        <td className="px-5 py-3.5 font-medium text-[#1A2332]">
                          <div className="font-bold text-sm">{student.name}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] text-xs text-[#4A5568]">
                          {student.registration}
                        </td>
                        {bimesterAssessments.map((av) => {
                          const sc = studentGradesMap[student.student_id]?.[av.assessment_id];
                          return (
                            <td
                              key={av.assessment_id}
                              className="px-4 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]"
                            >
                              {sc !== null && sc !== undefined ? sc.toFixed(1) : "—"}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-sm bg-[#F0F4F8] text-[#1B4F8A]">
                          {avg !== null && avg !== undefined ? avg.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-center text-xs font-bold">
                          {avg !== null && avg !== undefined ? (
                            avg >= 6.0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#0B4622]">
                                APROVADO
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                                RECUPERAÇÃO
                              </span>
                            )
                          ) : (
                            <span className="text-[#6B7A8D]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider">Estudante</th>
                    <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Matrícula</th>
                    <th scope="col" className="px-2 py-3.5 font-bold uppercase tracking-wider text-center">1º BM</th>
                    <th scope="col" className="px-2 py-3.5 font-bold uppercase tracking-wider text-center">2º BM</th>
                    <th scope="col" className="px-2 py-3.5 font-bold uppercase tracking-wider text-center">3º BM</th>
                    <th scope="col" className="px-2 py-3.5 font-bold uppercase tracking-wider text-center">4º BM</th>
                    <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center bg-[#F0F4F8] text-[#1B4F8A]">
                      Média Geral
                    </th>
                    <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Situação Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F7]">
                  {students.map((student) => {
                    const b1 = studentBimesterAverages[student.student_id]?.["1º BM"];
                    const b2 = studentBimesterAverages[student.student_id]?.["2º BM"];
                    const b3 = studentBimesterAverages[student.student_id]?.["3º BM"];
                    const b4 = studentBimesterAverages[student.student_id]?.["4º BM"];

                    const validScores = [b1, b2, b3, b4].filter((n): n is number => n !== null && n !== undefined);
                    const mediaGeral =
                      validScores.length > 0
                        ? validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length
                        : null;

                    const situacao =
                      mediaGeral === null
                        ? "—"
                        : mediaGeral >= 6.0
                        ? "APROVADO"
                        : mediaGeral >= 4.0
                        ? "RECUPERAÇÃO"
                        : "REPROVADO";

                    return (
                      <tr key={student.student_id} className="hover:bg-[#FAFBFD]">
                        <td className="px-5 py-3 font-medium text-[#1A2332]">
                          <div className="font-bold">{student.name}</div>
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-['JetBrains_Mono'] text-[#4A5568]">
                          {student.registration}
                        </td>
                        <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]">
                          {b1 !== null && b1 !== undefined ? b1.toFixed(1) : "—"}
                        </td>
                        <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]">
                          {b2 !== null && b2 !== undefined ? b2.toFixed(1) : "—"}
                        </td>
                        <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]">
                          {b3 !== null && b3 !== undefined ? b3.toFixed(1) : "—"}
                        </td>
                        <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]">
                          {b4 !== null && b4 !== undefined ? b4.toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center font-['JetBrains_Mono'] font-bold text-sm bg-[#F0F4F8] text-[#1B4F8A]">
                          {mediaGeral !== null ? mediaGeral.toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-bold">
                          {situacao === "APROVADO" ? <span className="text-[#0B4622]">APROVADO</span> : situacao === "RECUPERAÇÃO" ? <span className="text-[#92400E]">RECUP.</span> : <span className="text-[#7B1C1C]">REPROV.</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="p-4 bg-[#FAFBFD] border-t border-[#EEF2F7] text-xs text-[#4A5568] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1B4F8A] font-semibold">
              <Info size={14} aria-hidden /> Digite as notas dos alunos nos campos acima e clique em "Publicar no Sistema" para salvar.
            </span>
          </div>
        </section>
      )}

      {/* 2. GRID DE FREQUÊNCIA E CHAMADA MENSAL */}
      {tipoRegistro === "frequencia" && (
        <>
          {/* PAINEL DE ALERTAS PEDAGÓGICOS E INFREQUÊNCIA DO DOCENTE */}
          {attendanceAlerts.length > 0 && (
            <div className="mb-4 bg-white rounded-xl border border-[#FDE68A] shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-[#FFFBEB] border-b border-[#FDE68A] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#D97706]" aria-hidden />
                  <h3 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                    Alertas Pedagógicos de Frequência ({attendanceAlerts.length})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#92400E]">
                  Atenção aos prazos e acompanhamento preventivo de assiduidade
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {attendanceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                      alert.severity === "danger"
                        ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                        : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                    }`}
                  >
                    <AlertTriangle
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${
                        alert.severity === "danger" ? "text-[#DC2626]" : "text-[#D97706]"
                      }`}
                    />
                    <div>
                      <strong className="block font-bold">{alert.title}</strong>
                      <span className="text-[#4A5568]">{alert.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <section aria-label="Tabela de registro de frequência" className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-5 overflow-hidden">
            {/* Cabeçalho com Títulos Padronizados e Botão de Configuração de Horários */}
            <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between flex-wrap gap-3 bg-white">
              <div>
                <h2 className="text-sm font-bold text-[#1A2332]">
                  {freqBimester !== "Consolidado"
                    ? `Chamada Mensal — ${freqBimester} (${selectedSubject})`
                    : `Frequência Consolidada — ${selectedSubject}`}
                </h2>
                <p className="text-xs text-[#4A5568] mt-0.5">
                  Turma: <strong>{currentClass?.name || "9º Ano A - Manhã"}</strong> · Ano Letivo: <strong>{selectedAno}</strong>
                </p>
              </div>

              <button
                onClick={() => setShowScheduleConfigModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EEF2F7] text-[#1B4F8A] border-2 border-[#1B4F8A] text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                aria-label="Configurar período de vigência e horários das aulas"
              >
                <Settings size={14} aria-hidden />
                ⚙️ Configurar Horários e Vigência
              </button>
            </div>

            {/* Navegação entre os Meses do Bimestre Selecionado */}
            {freqBimester !== "Consolidado" && (
              <div className="bg-[#FAFBFD] px-5 py-3 border-b border-[#EEF2F7] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6B7A8D] uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-[#1B4F8A]" />
                    Mês de Referência:
                  </span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#C8D5E8] shadow-sm">
                    {(bimesterMonthsMap[freqBimester] || []).map((m) => (
                      <button
                        key={m.index}
                        onClick={() => setFreqSelectedMonthIndex(m.index)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          freqSelectedMonthIndex === m.index
                            ? "bg-[#1B4F8A] text-white shadow-sm"
                            : "text-[#4A5568] hover:bg-[#EEF2F7]"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B4F8A] bg-[#EEF2F7] px-2.5 py-1 rounded-lg border border-[#C8D5E8]">
                    {activeClassDays.length} Dias de Aula Configurados
                  </span>
                  <button
                    onClick={() => {
                      const months = bimesterMonthsMap[freqBimester] || [];
                      const currentPos = months.findIndex((m) => m.index === freqSelectedMonthIndex);
                      if (currentPos > 0) setFreqSelectedMonthIndex(months[currentPos - 1].index);
                    }}
                    disabled={
                      (bimesterMonthsMap[freqBimester] || []).findIndex((m) => m.index === freqSelectedMonthIndex) <= 0
                    }
                    className="px-3 py-1.5 bg-white hover:bg-[#EEF2F7] disabled:opacity-40 disabled:cursor-not-allowed border border-[#C8D5E8] text-xs font-bold text-[#1A2332] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Mês Anterior
                  </button>
                  <button
                    onClick={() => {
                      const months = bimesterMonthsMap[freqBimester] || [];
                      const currentPos = months.findIndex((m) => m.index === freqSelectedMonthIndex);
                      if (currentPos < months.length - 1) setFreqSelectedMonthIndex(months[currentPos + 1].index);
                    }}
                    disabled={
                      (bimesterMonthsMap[freqBimester] || []).findIndex((m) => m.index === freqSelectedMonthIndex) >=
                      (bimesterMonthsMap[freqBimester] || []).length - 1
                    }
                    className="px-3 py-1.5 bg-white hover:bg-[#EEF2F7] disabled:opacity-40 disabled:cursor-not-allowed border border-[#C8D5E8] text-xs font-bold text-[#1A2332] rounded-lg transition-colors flex items-center gap-1"
                  >
                    Mês Seguinte <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* TABELA DE CHAMADA MENSAL (MODO BIMESTRE) */}
            {freqBimester !== "Consolidado" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                  <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider sticky left-0 bg-[#FAFBFD] z-10 min-w-[170px]">
                        Estudante
                      </th>
                      <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-center">
                        Matrícula
                      </th>

                      {/* Colunas dos Dias de Aula Configurados com Botão Alternável ✓ Total / ✖ Limpar */}
                      {activeClassDays.map((day) => {
                        const isFull = isDayFullPresence(day);

                        return (
                          <th
                            key={day.dateStr}
                            scope="col"
                            className={`px-2 py-2.5 text-center border-l border-[#EEF2F7] min-w-[58px] ${
                              day.isExtra ? "bg-[#FEF3C7]/40" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] text-[#6B7A8D] font-bold uppercase">
                                {day.weekdayShort}
                              </span>
                              <span className="text-xs font-bold text-[#1A2332] font-['JetBrains_Mono'] leading-none">
                                {String(day.dayNumber).padStart(2, "0")}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                                  day.isExtra
                                    ? "bg-[#F59E0B] text-white"
                                    : "bg-[#EEF2F7] text-[#1B4F8A]"
                                }`}
                              >
                                {day.lessonCount}T
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleDayPresence(day)}
                                title={
                                  isFull
                                    ? "Limpar presença em todos os alunos"
                                    : `Aplicar presença total (${day.lessonCount}P) em todos os alunos`
                                }
                                className={`mt-1 px-1.5 py-0.5 text-[8px] font-bold rounded border transition-colors leading-none cursor-pointer flex items-center justify-center gap-0.5 ${
                                  isFull
                                    ? "bg-[#FCE8E6] hover:bg-[#FAD2CF] text-[#7A1C1C] border-[#F5C2C7]"
                                    : "bg-[#E6F4EA] hover:bg-[#C8E6C9] text-[#0B4622] border-[#A3CFBB]"
                                }`}
                              >
                                {isFull ? "✖ Limpar" : "✓ Total"}
                              </button>
                            </div>
                          </th>
                        );
                      })}

                      {/* Totalizadores do Mês */}
                      <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-center bg-[#F0F4F8] border-l-2 border-[#CBD5E1]">
                        Aulas
                      </th>
                      <th scope="col" className="px-2 py-3 font-bold uppercase tracking-wider text-center text-[#0B4622] bg-[#E6F4EA]/40">
                        P
                      </th>
                      <th scope="col" className="px-2 py-3 font-bold uppercase tracking-wider text-center text-[#7A1C1C] bg-[#FCE8E6]/40">
                        F
                      </th>
                      <th scope="col" className="px-2 py-3 font-bold uppercase tracking-wider text-center text-[#4338CA] bg-[#EEF2FF]/40">
                        FJ
                      </th>
                      <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-center bg-[#1B4F8A] text-white">
                        % Freq.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7]">
                    {students.map((student) => {
                      const stats = getStudentMonthlyStats(student.student_id);

                      return (
                        <tr key={student.student_id} className="hover:bg-[#FAFBFD]">
                          <td className="px-4 py-3 font-bold text-sm text-[#1A2332] sticky left-0 bg-white z-10 shadow-xs">
                            {student.name}
                          </td>
                          <td className="px-3 py-3 text-center font-['JetBrains_Mono'] text-xs text-[#4A5568]">
                            {student.registration}
                          </td>

                          {/* Células de Frequência dos Dias Letivos */}
                          {activeClassDays.map((day) => {
                            const code = getAttendanceCode(student.student_id, day);
                            const isP = code.endsWith("P") && !code.includes("1F");
                            const isHalf = code.includes("1P 1F") || code.includes("2P 1F");
                            const isF = code.endsWith("F") && !isHalf;
                            const isFJ = code.endsWith("FJ");

                            return (
                              <td
                                key={day.dateStr}
                                className="px-1.5 py-2 text-center border-l border-[#EEF2F7]"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleCycleAttendance(student.student_id, day)}
                                  title={`Clique para alternar presença de ${student.name} no dia ${day.dayNumber} (${day.slotsText})`}
                                  className={`w-11 h-8 mx-auto rounded-lg font-bold font-['JetBrains_Mono'] text-xs border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                                    isP
                                      ? "bg-[#E6F4EA] text-[#0B4622] border-[#A3CFBB] hover:bg-[#CEEAD6]"
                                      : isHalf
                                      ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]"
                                      : isF
                                      ? "bg-[#FCE8E6] text-[#7A1C1C] border-[#F5C2C7] hover:bg-[#FAD2CF]"
                                      : "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE] hover:bg-[#E0E7FF]"
                                  }`}
                                >
                                  {code}
                                </button>
                              </td>
                            );
                          })}

                          {/* Totais do Aluno */}
                          <td className="px-3 py-3 text-center font-['JetBrains_Mono'] font-bold text-xs bg-[#F0F4F8] text-[#1A2332] border-l-2 border-[#CBD5E1]">
                            {stats.totalLessons}
                          </td>
                          <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-xs text-[#0B4622] bg-[#E6F4EA]/20">
                            {stats.presences}
                          </td>
                          <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-xs text-[#7A1C1C] bg-[#FCE8E6]/20">
                            {stats.absences}
                          </td>
                          <td className="px-2 py-3 text-center font-['JetBrains_Mono'] font-bold text-xs text-[#4338CA] bg-[#EEF2FF]/20">
                            {stats.justifiedAbsences}
                          </td>
                          <td className="px-3 py-3 text-center font-['JetBrains_Mono'] font-bold text-xs text-[#1B4F8A]">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-md font-bold ${
                                stats.rate >= 75
                                  ? "bg-[#E6F4EA] text-[#0B4622]"
                                  : "bg-[#FCE8E6] text-[#7A1C1C]"
                              }`}
                            >
                              {stats.rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABELA DE FREQUÊNCIA CONSOLIDADA ANUAL (MODO CONSOLIDADO - 3º E 4º BIMESTRES SEM REGISTRO) */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider">Estudante</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Matrícula</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">1º Bimestre</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">2º Bimestre</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">3º Bimestre</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">4º Bimestre</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Total Aulas</th>
                      <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Total Faltas</th>
                      <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center bg-[#F0F4F8] text-[#1B4F8A]">
                        % Frequência Geral
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Situação Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2F7]">
                    {students.map((st) => {
                      const cData = consolidatedAttendanceData[st.student_id] || {
                        b1: { classes: 48, absences: 2, rate: 96 },
                        b2: { classes: 50, absences: 4, rate: 92 },
                        b3: { classes: 0, absences: 0, rate: null },
                        b4: { classes: 0, absences: 0, rate: null },
                      };
                      // Considerar apenas bimestres com dados lançados (1º e 2º BM)
                      const totalClasses = cData.b1.classes + cData.b2.classes;
                      const totalAbsences = cData.b1.absences + cData.b2.absences;
                      const overallRate = totalClasses > 0 ? Math.round(((totalClasses - totalAbsences) / totalClasses) * 100) : 100;
                      const isApproved = overallRate >= 75;

                      return (
                        <tr key={st.student_id} className="hover:bg-[#FAFBFD]">
                          <td className="px-5 py-3.5 font-bold text-sm text-[#1A2332]">{st.name}</td>
                          <td className="px-3 py-3.5 text-center font-['JetBrains_Mono'] text-[#4A5568]">{st.registration}</td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="font-bold text-[#1A2332]">{cData.b1.rate}%</span>
                            <span className="block text-[10px] text-[#6B7A8D]">({cData.b1.absences}F / {cData.b1.classes} aulas)</span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="font-bold text-[#1A2332]">{cData.b2.rate}%</span>
                            <span className="block text-[10px] text-[#6B7A8D]">({cData.b2.absences}F / {cData.b2.classes} aulas)</span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold text-[#6B7A8D] bg-[#F1F3F5] rounded border border-[#CED4DA]">
                              — Sem registro
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold text-[#6B7A8D] bg-[#F1F3F5] rounded border border-[#CED4DA]">
                              — Sem registro
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#1A2332]">{totalClasses}</td>
                          <td className="px-3 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-sm text-[#C0392B]">{totalAbsences}</td>
                          <td className="px-4 py-3.5 text-center font-['JetBrains_Mono'] font-bold text-base text-[#1B4F8A] bg-[#F0F4F8]">
                            {overallRate}%
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-[#E6F4EA] text-[#0B4622] border border-[#A3CFBB]">
                                <CheckCircle size={13} /> ✓ Aprovado por Frequência
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-[#FCE8E6] text-[#7A1C1C] border border-[#F5C2C7]">
                                <AlertTriangle size={13} /> ⚠️ Reprovado por Falta
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legenda Explicativa dos Símbolos e Letras no Rodapé */}
            <div className="bg-[#FAFBFD] p-4 border-t border-[#EEF2F7] text-xs text-[#4A5568] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap font-semibold">
                <span className="font-bold text-[#1A2332] uppercase tracking-wide mr-1">Legenda:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E6F4EA] text-[#0B4622] border border-[#A3CFBB]">
                  <strong>1P / 2P</strong> = Presença Integral nos tempos
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  <strong>1P 1F</strong> = Presença Parcial (1 Falta, 1 Presença)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FCE8E6] text-[#7A1C1C] border border-[#F5C2C7]">
                  <strong>1F / 2F</strong> = Falta não justificada
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                  <strong>1FJ / 2FJ</strong> = Falta Justificada (Atestado)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EEF2F7] text-[#1B4F8A] border border-[#C8D5E8]">
                  <strong>1T / 2T / 3T</strong> = Quantidade de tempos de aula no dia
                </span>
              </div>
              <div className="text-[11px] text-[#6B7A8D] italic">
                * Conforme a LDB (Art. 24, VI), a frequência mínima para aprovação é de 75% da carga horária.
              </div>
            </div>
          </section>
        </>
      )}

      {/* 3. PAINEL DE GESTÃO DE AVISOS E COMUNICADOS */}
      {tipoRegistro === "avisos" && (
        <section aria-label="Gestão de avisos e comunicados" className="bg-white rounded-xl border border-[#C8D5E8] shadow-sm mb-5 overflow-hidden">
          {/* Cabeçalho do Mural */}
          <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A2332]">
                Mural de Avisos e Comunicados — {selectedSubject} ({currentClass?.name})
              </h2>
              <p className="text-xs text-[#4A5568] mt-0.5">
                Cadastre, edite e acompanhe se os comunicados foram lidos pelos responsáveis.
              </p>
            </div>

            <button
              onClick={handleOpenCreateAnnModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4F8A] hover:bg-[#15407A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
              aria-label="Cadastrar novo aviso ou comunicado"
            >
              <Plus size={14} aria-hidden />
              + Novo Aviso / Comunicado
            </button>
          </div>

          {/* TABELA DE GESTÃO DE AVISOS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#EEF2F7]">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-bold uppercase tracking-wider">Título e Resumo</th>
                  <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Destinatário</th>
                  <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider">Emissor / Remetente</th>
                  <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider">Prioridade & Tags</th>
                  <th scope="col" className="px-3 py-3.5 font-bold uppercase tracking-wider text-center">Data</th>
                  <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Status de Leitura</th>
                  <th scope="col" className="px-4 py-3.5 font-bold uppercase tracking-wider text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F7]">
                {filteredTeacherAnnouncements.length > 0 ? (
                  filteredTeacherAnnouncements.map((ann) => {
                    const cat = ann.category || "GENERAL";
                    return (
                      <tr key={ann.id} className="hover:bg-[#FAFBFD]">
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-bold text-sm text-[#1A2332] leading-snug">{ann.title}</div>
                          <div className="text-xs text-[#4A5568] line-clamp-1 mt-0.5">{ann.content}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {ann.target_type === "STUDENT" ? (
                            <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE]">
                              Aluno: {ann.student_name || "Específico"}
                            </span>
                          ) : ann.target_type === "CLASSROOM" ? (
                            <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                              Turma ({currentClass?.name || "9º Ano A"})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                              Geral (Escola Toda)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#1A2332]">
                          {ann.sender || "Coordenação Pedagógica"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                cat === "URGENT"
                                  ? "bg-[#FEE2E2] text-[#7B1C1C]"
                                  : cat === "IMPORTANT"
                                  ? "bg-[#FEF3C7] text-[#92400E]"
                                  : cat === "EVENT"
                                  ? "bg-[#EEF2FF] text-[#4338CA]"
                                  : "bg-[#EEF2F7] text-[#1A2332]"
                              }`}
                            >
                              {cat === "URGENT"
                                ? "Urgente"
                                : cat === "IMPORTANT"
                                ? "Importante"
                                : cat === "EVENT"
                                ? "Evento"
                                : "Geral"}
                            </span>
                            {ann.tags?.map((t, idx) => (
                              <span
                                key={idx}
                                style={{
                                  color: t.color || "#1B4F8A",
                                  backgroundColor: t.bg || (t.color ? t.color + "18" : "#EEF2F7"),
                                  borderColor: t.color || "#C8D5E8",
                                }}
                                className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded border"
                              >
                                #{t.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center font-['JetBrains_Mono'] text-xs text-[#6B7A8D]">
                          {ann.date_published}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {ann.is_read ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-[#E6F4EA] text-[#0B4622] border border-[#A3CFBB]">
                                <CheckCircle size={12} />
                                ✓ Lido pelo Responsável
                              </span>
                              {ann.read_at && (
                                <span className="block text-[10px] text-[#6B7A8D] font-['JetBrains_Mono'] mt-0.5">
                                  {ann.read_at}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
                              <Clock size={12} />
                              Aguardando Leitura
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleOpenEditAnnModal(ann)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#1B4F8A] hover:bg-[#EEF2F7] rounded-lg border border-[#1B4F8A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                            aria-label={`Editar aviso ${ann.title}`}
                          >
                            <Edit size={12} />
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[#6B7A8D]">
                      Nenhum comunicado encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#FAFBFD] border-t border-[#EEF2F7] text-xs text-[#4A5568] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1B4F8A] font-semibold">
              <Info size={14} aria-hidden /> Todos os comunicados cadastrados pelo docente ficam imediatamente visíveis no Modo Pais.
            </span>
          </div>
        </section>
      )}

      {/* Botões de Ação para Notas / Frequência */}
      {(isSpecificAssessmentMode || tipoRegistro === "frequencia") && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#1B4F8A] hover:bg-[#15407A] text-white font-bold rounded-xl text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
          >
            {isSubmitting ? "Sincronizando..." : "Publicar no Sistema"}
          </button>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE AVISOS E COMUNICADOS */}
      {showAnnModal && (
        <div
          ref={annModalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-labelledby="ann-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-[#C8D5E8] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
              <h2 id="ann-modal-title" className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4'] flex items-center gap-2">
                <Megaphone size={20} className="text-[#1B4F8A]" />
                {isEditingAnn ? "Editar Aviso / Comunicado" : "Novo Aviso / Comunicado Pedagógico"}
              </h2>
              <button
                onClick={() => setShowAnnModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="p-6 space-y-4 overflow-y-auto text-sm flex-1">
              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Título do Comunicado *
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Ex: Plantão Especial de Geometria Plana"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Mensagem / Conteúdo do Aviso *
                </label>
                <textarea
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Digite o texto detalhado do comunicado para os responsáveis..."
                />
              </div>

              {/* Destinatário e Emissor Formal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                    Destinatário
                  </label>
                  <select
                    value={annTargetType}
                    onChange={(e) => setAnnTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-semibold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  >
                    <option value="CLASSROOM">Toda a Turma ({currentClass?.name || "9º Ano A"})</option>
                    <option value="STUDENT">Aluno Específico da Turma</option>
                    <option value="ALL">Geral (Toda a Escola)</option>
                  </select>
                </div>

                {annTargetType === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                      Selecionar Aluno Específico
                    </label>
                    <select
                      value={annStudentId || ""}
                      onChange={(e) => setAnnStudentId(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-semibold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                    >
                      {students.map((st) => (
                        <option key={st.student_id} value={st.student_id}>
                          {st.name} ({st.registration})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                    Cargo / Emissor Formal
                  </label>
                  <select
                    value={
                      annSenderRole === "PROFESSOR"
                        ? "PROFESSOR"
                        : annSenderRole === "COORDENACAO"
                        ? "COORDENACAO"
                        : annSenderRole === "DIRECAO"
                        ? "DIRECAO"
                        : "SECRETARIA"
                    }
                    onChange={(e) => {
                      const role = e.target.value as any;
                      setAnnSenderRole(role);
                      if (role === "PROFESSOR") setAnnSenderName("Prof. Carlos Mendes");
                      else if (role === "COORDENACAO") setAnnSenderName("Coordenação Pedagógica");
                      else if (role === "DIRECAO") setAnnSenderName("Direção Geral");
                      else setAnnSenderName("Secretaria Escolar");
                    }}
                    className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-semibold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  >
                    <option value="PROFESSOR">
                      Prof. Carlos Mendes — {selectedSubject} ({currentClass?.name || "9º Ano A"})
                    </option>
                    <option value="COORDENACAO">Coordenação Pedagógica</option>
                    <option value="DIRECAO">Direção Geral</option>
                    <option value="SECRETARIA">Secretaria Escolar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                    Prioridade / Nível de Urgência
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-semibold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  >
                    <option value="GENERAL">Geral (Informativo)</option>
                    <option value="IMPORTANT">Importante</option>
                    <option value="URGENT">Urgente</option>
                    <option value="EVENT">Evento Escolar</option>
                  </select>
                </div>
              </div>

              {/* Tags Padrão de Assuntos */}
              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-2">
                  Tags Padrão de Assuntos
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {STANDARD_TAGS.map((tag) => {
                    const isSelected = annSelectedTags.some(
                      (t) => t.label.toLowerCase() === tag.label.toLowerCase()
                    );
                    return (
                      <button
                        type="button"
                        key={tag.label}
                        onClick={() => handleToggleTag(tag)}
                        style={{
                          backgroundColor: isSelected ? tag.color : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : tag.color,
                          borderColor: tag.color,
                        }}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border-2 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isSelected && <Check size={12} />}
                        #{tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Criação de Tags Personalizadas com Cores */}
              <div className="bg-[#FAFBFD] p-3.5 rounded-xl border border-[#C8D5E8]">
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-2">
                  Criar Nova Tag Personalizada
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                    placeholder="Ex: OBMEP 2026, Robótica..."
                    className="px-3 py-1.5 border-2 border-[#6B7A8D] rounded-lg text-xs font-bold flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  >
                  </input>

                  {/* Seletor de Cores da Paleta */}
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        type="button"
                        key={c.color}
                        onClick={() => setCustomTagColor(c.color)}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          customTagColor === c.color ? "scale-125 border-black" : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-[#1B4F8A] hover:bg-[#15407A] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Adicionar Tag
                  </button>
                </div>

                {/* Tags Selecionadas no Momento */}
                {annSelectedTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#EEF2F7]">
                    <span className="text-[11px] font-bold text-[#6B7A8D]">Tags anexadas:</span>
                    {annSelectedTags.map((t) => (
                      <span
                        key={t.label}
                        style={{
                          color: t.color,
                          backgroundColor: t.bg || (t.color ? t.color + "18" : "#EEF2F7"),
                          borderColor: t.color,
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded border"
                      >
                        #{t.label}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t.label)}
                          className="hover:opacity-75 p-0.5"
                          aria-label={`Remover tag ${t.label}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex gap-3 justify-end px-6 pb-6 pt-3 border-t border-[#EEF2F7] bg-white">
              <button
                type="button"
                onClick={() => setShowAnnModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#C8D5E8] text-[#374151] hover:bg-[#EEF2F7]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={isSavingAnn}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-[#1B4F8A] text-white hover:bg-[#15407A] shadow-sm flex items-center gap-1.5"
              >
                <Send size={14} />
                {isSavingAnn ? "Salvando..." : isEditingAnn ? "Atualizar no Mural" : "Publicar no Mural"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Avaliação para a Turma */}
      {showAddAvModal && (
        <div
          ref={addAvModalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-labelledby="add-av-class-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#C8D5E8] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
              <h2 id="add-av-class-title" className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4']">
                Nova Avaliação para a Turma ({selectedBimester})
              </h2>
              <button
                onClick={() => setShowAddAvModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <p className="text-xs text-[#4A5568]">
                A avaliação será criada para todos os alunos do <strong>{currentClass?.name}</strong> em <strong>{selectedSubject}</strong> ({selectedBimester}). As notas serão digitadas diretamente na tabela.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Nome da Avaliação (Sequencial)
                </label>
                <input
                  type="text"
                  value={newAvTitle}
                  onChange={(e) => setNewAvTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Ex: Avaliação 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SelectField
                    id="modal-av-tipo"
                    label="Tipo"
                    value={newAvType}
                    onChange={setNewAvType}
                    options={["Trabalho", "Prova", "Atividade Prática", "Seminário"]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                    Peso
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5.0"
                    value={newAvWeight}
                    onChange={(e) => setNewAvWeight(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-['JetBrains_Mono'] font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Descrição / Conteúdo (Opcional)
                </label>
                <input
                  type="text"
                  value={newAvDesc}
                  onChange={(e) => setNewAvDesc(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#C8D5E8] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Ex: Funções e Equações do 2º Grau"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 pb-6 pt-2 border-t border-[#EEF2F7]">
              <button
                onClick={() => setShowAddAvModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#C8D5E8] text-[#374151] hover:bg-[#EEF2F7]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewAssessmentForClass}
                disabled={isAddingAv}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#1B4F8A] text-white hover:bg-[#15407A]"
              >
                {isAddingAv ? "Criando..." : "Criar Avaliação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Avaliação Existente */}
      {showEditAvModal && (
        <div
          ref={editAvModalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-labelledby="edit-av-class-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#C8D5E8] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
              <h2 id="edit-av-class-title" className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4']">
                Editar {selectedAssessment} ({selectedBimester})
              </h2>
              <button
                onClick={() => setShowEditAvModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <p className="text-xs text-[#4A5568]">
                Altere os parâmetros da avaliação para toda a turma. As médias ponderadas serão recalculadas automaticamente.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Título / Nome da Avaliação
                </label>
                <input
                  type="text"
                  value={editAvTitle}
                  onChange={(e) => setEditAvTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Ex: Avaliação 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SelectField
                    id="modal-edit-av-tipo"
                    label="Tipo"
                    value={editAvType}
                    onChange={setEditAvType}
                    options={["Prova", "Trabalho", "Atividade Prática", "Seminário"]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                    Peso
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5.0"
                    value={editAvWeight}
                    onChange={(e) => setEditAvWeight(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-['JetBrains_Mono'] font-bold text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                  Descrição / Conteúdo (Opcional)
                </label>
                <input
                  type="text"
                  value={editAvDesc}
                  onChange={(e) => setEditAvDesc(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#C8D5E8] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                  placeholder="Ex: Funções Afim e Quadrática"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 pb-6 pt-2 border-t border-[#EEF2F7]">
              <button
                onClick={() => setShowEditAvModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-[#C8D5E8] text-[#374151] hover:bg-[#EEF2F7]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditAssessment}
                disabled={isEditingAv}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#1B4F8A] text-white hover:bg-[#15407A]"
              >
                {isEditingAv ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÃO DE VIGÊNCIA, GRADE HORÁRIA E AULAS */}
      {showScheduleConfigModal && (
        <div
          ref={scheduleModalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-labelledby="schedule-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-[#C8D5E8] overflow-hidden max-h-[92vh] flex flex-col">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
              <h2 id="schedule-modal-title" className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4'] flex items-center gap-2">
                <Settings size={20} className="text-[#1B4F8A]" />
                Configurar Vigência, Grade Horária e Aulas — {selectedSubject} ({freqBimester})
              </h2>
              <button
                onClick={() => setShowScheduleConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
                aria-label="Fechar modal de configuração"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6 overflow-y-auto text-sm flex-1">
              {/* 1. Período de Vigência e Duração */}
              <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#C8D5E8] space-y-4">
                <h3 className="text-xs font-bold text-[#1A2332] uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[#1B4F8A]" />
                  1. Período de Vigência do Bimestre e Duração dos Tempos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                      Data Inicial de Vigência *
                    </label>
                    <input
                      type="date"
                      value={scheduleConfig.startDate}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-bold text-xs text-[#1A2332] font-['JetBrains_Mono'] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                      Data Final de Vigência *
                    </label>
                    <input
                      type="date"
                      value={scheduleConfig.endDate}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-bold text-xs text-[#1A2332] font-['JetBrains_Mono'] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A2332] uppercase mb-1">
                      Duração por Tempo de Aula
                    </label>
                    <select
                      value={scheduleConfig.lessonDuration}
                      onChange={(e) =>
                        setScheduleConfig((prev) => ({
                          ...prev,
                          lessonDuration: parseInt(e.target.value, 10) as any,
                        }))
                      }
                      className="w-full px-3 py-2 border-2 border-[#6B7A8D] rounded-lg font-semibold text-xs text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B4F8A]"
                    >
                      <option value="40">40 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="50">50 minutos (Padrão)</option>
                      <option value="60">60 minutos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Dias da Semana e Horários das Aulas */}
              <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#C8D5E8] space-y-3">
                <h3 className="text-xs font-bold text-[#1A2332] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-[#1B4F8A]" />
                  2. Dias da Semana, Quantidade de Tempos e Horários (07:00 às 22:00)
                </h3>
                <p className="text-xs text-[#6B7A8D]">
                  Selecione os dias da semana em que você leciona para esta turma e configure os tempos e horários de aula:
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    { dayNum: 1, label: "Segunda-feira" },
                    { dayNum: 2, label: "Terça-feira" },
                    { dayNum: 3, label: "Quarta-feira" },
                    { dayNum: 4, label: "Quinta-feira" },
                    { dayNum: 5, label: "Sexta-feira" },
                    { dayNum: 6, label: "Sábado Letivo" },
                  ].map((wd) => {
                    const isChecked = scheduleConfig.weeklyDays.includes(wd.dayNum);
                    const currentLesson = scheduleConfig.dailyLessons[wd.dayNum] || {
                      lessonCount: 2,
                      slotsText: "1º e 2º tempos (07:30 - 09:10)",
                      startTime: "07:30",
                      endTime: "09:10",
                    };

                    return (
                      <div
                        key={wd.dayNum}
                        className={`p-3 rounded-lg border transition-all ${
                          isChecked
                            ? "bg-white border-[#1B4F8A] shadow-xs"
                            : "bg-[#F3F4F6] border-[#E5E7EB] opacity-75"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#1A2332] min-w-[130px]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleWeeklyDay(wd.dayNum)}
                              className="w-4 h-4 text-[#1B4F8A] rounded focus:ring-[#1B4F8A]"
                            />
                            {wd.label}
                          </label>

                          {isChecked && (
                            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                              <select
                                value={currentLesson.lessonCount}
                                onChange={(e) => {
                                  const count = parseInt(e.target.value, 10);
                                  const text =
                                    count === 1
                                      ? "1º tempo (07:30 - 08:20)"
                                      : count === 2
                                      ? "1º e 2º tempos (07:30 - 09:10)"
                                      : "1º, 2º e 3º tempos (07:30 - 10:00)";
                                  setScheduleConfig((prev) => ({
                                    ...prev,
                                    dailyLessons: {
                                      ...prev.dailyLessons,
                                      [wd.dayNum]: {
                                        ...currentLesson,
                                        lessonCount: count,
                                        slotsText: text,
                                      },
                                    },
                                  }));
                                }}
                                className="px-2.5 py-1.5 border border-[#C8D5E8] rounded-lg text-xs font-semibold text-[#1A2332]"
                              >
                                <option value="1">1 Tempo de Aula</option>
                                <option value="2">2 Tempos Seguidos (1º e 2º)</option>
                                <option value="2">2 Tempos Alternados (1º e 3º)</option>
                                <option value="3">3 Tempos de Aula</option>
                              </select>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-[#6B7A8D]">Início:</span>
                                <input
                                  type="time"
                                  min="07:00"
                                  max="22:00"
                                  value={currentLesson.startTime || "07:30"}
                                  onChange={(e) => {
                                    setScheduleConfig((prev) => ({
                                      ...prev,
                                      dailyLessons: {
                                        ...prev.dailyLessons,
                                        [wd.dayNum]: {
                                          ...currentLesson,
                                          startTime: e.target.value,
                                        },
                                      },
                                    }));
                                  }}
                                  className="px-2 py-1 border border-[#C8D5E8] rounded text-xs font-['JetBrains_Mono'] font-bold"
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-[#6B7A8D]">Fim:</span>
                                <input
                                  type="time"
                                  min="07:00"
                                  max="22:00"
                                  value={currentLesson.endTime || "09:10"}
                                  onChange={(e) => {
                                    setScheduleConfig((prev) => ({
                                      ...prev,
                                      dailyLessons: {
                                        ...prev.dailyLessons,
                                        [wd.dayNum]: {
                                          ...currentLesson,
                                          endTime: e.target.value,
                                        },
                                      },
                                    }));
                                  }}
                                  className="px-2 py-1 border border-[#C8D5E8] rounded text-xs font-['JetBrains_Mono'] font-bold"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Exceções: Dias Sem Aula / Feriados e Aulas Extras */}
              <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#C8D5E8] space-y-4">
                <h3 className="text-xs font-bold text-[#1A2332] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-[#D97706]" />
                  3. Exceções do Calendário (Feriados, Recessos e Aulas Extras)
                </h3>

                {/* Lista de Exceções Cadastradas */}
                <div className="space-y-2">
                  {scheduleConfig.exceptions.map((exc) => (
                    <div
                      key={exc.id}
                      className="flex items-center justify-between px-3.5 py-2 bg-white rounded-lg border border-[#EEF2F7] shadow-xs text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            exc.type === "NO_CLASS"
                              ? "bg-[#FCE8E6] text-[#7A1C1C] border border-[#F5C2C7]"
                              : "bg-[#E6F4EA] text-[#0B4622] border border-[#A3CFBB]"
                          }`}
                        >
                          {exc.type === "NO_CLASS" ? "Sem Aula / Feriado" : `Aula Extra (${exc.lessonCount || 2}T)`}
                        </span>
                        <span className="font-['JetBrains_Mono'] font-bold text-[#1A2332]">{exc.date}</span>
                        <span className="text-[#4A5568]">· {exc.reason}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveException(exc.id)}
                        className="text-[#C0392B] hover:text-[#902A1F] p-1 rounded hover:bg-[#FEE2E2]"
                        aria-label={`Remover exceção do dia ${exc.date}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulário para Cadastrar Nova Exceção */}
                <div className="p-3 bg-white rounded-lg border border-[#C8D5E8] space-y-3">
                  <span className="text-xs font-bold text-[#1A2332] block">Cadastrar Nova Exceção:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B7A8D] uppercase mb-1">Data</label>
                      <input
                        type="date"
                        value={newExcDate}
                        onChange={(e) => setNewExcDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#6B7A8D] rounded text-xs font-['JetBrains_Mono'] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B7A8D] uppercase mb-1">Tipo de Exceção</label>
                      <select
                        value={newExcType}
                        onChange={(e) => setNewExcType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-[#6B7A8D] rounded text-xs font-semibold"
                      >
                        <option value="NO_CLASS">Sem Aula / Feriado / Recesso</option>
                        <option value="EXTRA">Aula Extra / Reposição</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B7A8D] uppercase mb-1">Motivo / Descrição</label>
                      <input
                        type="text"
                        value={newExcReason}
                        onChange={(e) => setNewExcReason(e.target.value)}
                        placeholder="Ex: Feriado Municipal, Reposição..."
                        className="w-full px-2.5 py-1.5 border border-[#6B7A8D] rounded text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleAddException}
                        className="w-full px-3 py-1.5 bg-[#1B4F8A] hover:bg-[#15407A] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={13} />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex gap-3 justify-end px-6 pb-6 pt-3 border-t border-[#EEF2F7] bg-white">
              <button
                type="button"
                onClick={() => setShowScheduleConfigModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#C8D5E8] text-[#374151] hover:bg-[#EEF2F7]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScheduleConfigModal(false);
                  setToastMessage("✅ Grade horária e vigência atualizadas e recalculadas na chamada!");
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1B4F8A] hover:bg-[#15407A] text-white shadow-sm"
              >
                Salvar e Aplicar Grade Horária
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação — Nielsen #5 */}
      {showModal && (
        <div
          ref={confirmModalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm outline-none"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#C8D5E8] overflow-hidden">
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#EEF2F7]">
              <AlertTriangle size={20} className="text-[#7D4E00]" aria-hidden />
              <h2 id="modal-title" className="font-bold text-[#1A2332] text-lg font-['Source_Serif_4']">
                Confirmar Publicação
              </h2>
            </div>
            <div className="px-6 py-5 text-sm text-[#1A2332]">
              <p>
                Deseja confirmar a gravação dos dados no sistema? As notas e frequências serão salvas no banco de dados
                SQLite e refletirão imediatamente no painel da responsável <strong>(Maria Silva)</strong> e nos boletins dos alunos.
              </p>
            </div>
            <div className="flex gap-3 justify-end px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#C8D5E8]"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublicarConfirmado}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1B4F8A] text-white"
              >
                Sim, Publicar no Banco
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Developer Mode Screens ───────────────────────────────────────────────────

function SwaggerApiScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("integrantes")} />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#EEF2F7]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
              <Code className="text-[#1B4F8A]" size={28} />
              Documentação da API RESTful (Swagger UI)
            </h1>
            <p className="text-sm text-[#6B7A8D] mt-1">
              Especificação padronizada OpenAPI 3.0.3 com teste interativo de rotas.
            </p>
          </div>

          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#1B4F8A] hover:bg-[#153D6B] text-white font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <ExternalLink size={16} />
            Abrir Swagger UI em Nova Aba
          </a>
        </div>

        <div className="w-full h-[700px] border border-[#CBD5E1] rounded-xl overflow-hidden shadow-inner bg-[#FAFBFD]">
          <iframe
            src="http://127.0.0.1:8000/docs"
            title="Swagger UI — TrAcEs API RESTful"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </main>
  );
}

function IntegrantesScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("integrantes")} />

      {/* Integrantes da Equipe */}
      <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#EEF2F7] space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
            <Users className="text-[#1B4F8A]" size={28} />
            👥 Integrantes da Equipe de Desenvolvimento
          </h1>
          <p className="text-sm text-[#6B7A8D] mt-1">
            O projeto foi idealizado e implementado pelos seguintes discentes:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discente 1 */}
          <article className="p-5 rounded-xl border border-[#EEF2F7] bg-[#FAFBFD] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B4F8A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                AT
              </div>
              <div>
                <h2 className="font-bold text-base text-[#1A2332]">Antonio Alex Dayson Tomaz</h2>
                <p className="text-xs text-[#6B7A8D]">Desenvolvedor Full-stack & Analista de Usabilidade</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-[#4A5568] border-t border-[#EEF2F7] pt-3">
              <p><strong>Curso:</strong> Análise e Desenvolvimento de Sistemas (ADS)</p>
              <p><strong>Instituição:</strong> Universidade Federal do Cariri (UFCA)</p>
              <p>
                <strong>Contato:</strong>{" "}
                <a href="mailto:alex.dayson@aluno.ufca.edu.br" className="text-[#1B4F8A] hover:underline font-semibold">
                  alex.dayson@aluno.ufca.edu.br
                </a>
              </p>
            </div>
          </article>

          {/* Discente 2 */}
          <article className="p-5 rounded-xl border border-[#EEF2F7] bg-[#FAFBFD] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3B6C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                MT
              </div>
              <div>
                <h2 className="font-bold text-base text-[#1A2332]">Maria Alexsandra Tomaz</h2>
                <p className="text-xs text-[#6B7A8D]">Designer de Interface (UI/UX) & Engenheira de Requisitos</p>
              </div>
            </div>
            <div className="text-xs space-y-1 text-[#4A5568] border-t border-[#EEF2F7] pt-3">
              <p><strong>Curso:</strong> Análise e Desenvolvimento de Sistemas (ADS)</p>
              <p><strong>Instituição:</strong> Universidade Federal do Cariri (UFCA)</p>
              <p>
                <strong>Contato:</strong>{" "}
                <a href="mailto:alexsandra.tomaz@aluno.ufca.edu.br" className="text-[#1B4F8A] hover:underline font-semibold">
                  alexsandra.tomaz@aluno.ufca.edu.br
                </a>
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Informações Institucionais */}
      <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#EEF2F7] space-y-4">
        <h2 className="text-xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
          🏫 Informações Acadêmicas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Disciplina</span>
            <span className="font-semibold text-[#1A2332]">Projeto Integrado 3</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Curso</span>
            <span className="font-semibold text-[#1A2332]">Análise e Desenvolvimento de Sistemas</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Instituição</span>
            <span className="font-semibold text-[#1A2332]">Universidade Federal do Cariri (UFCA)</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Localização</span>
            <span className="font-semibold text-[#1A2332]">Juazeiro do Norte, Ceará, Brasil</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Ano de Desenvolvimento</span>
            <span className="font-semibold text-[#1A2332]">2026</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#EEF2F7]">
            <span className="block text-[#6B7A8D] font-bold">Status do Projeto</span>
            <span className="font-semibold text-[#0B4622]">✅ Homologado (79 Testes Aprovados)</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function SobreScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("integrantes")} />

      <article className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#EEF2F7] space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
            📖 Sobre a Trilha de Acompanhamento Escolar (TrAcEs)
          </h1>
          <p className="text-sm text-[#6B7A8D] mt-2 leading-relaxed">
            O <strong>TrAcEs</strong> é uma plataforma digital integrada de acompanhamento pedagógico e gestão escolar desenvolvida para conectar instituições de ensino e lares familiares, promovendo o monitoramento em tempo real do rendimento e da frequência dos estudantes.
          </p>
        </div>

        {/* 🏗️ Engenharia de Software */}
        <section className="space-y-3 border-t border-[#EEF2F7] pt-6">
          <h2 className="text-xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
            🏗️ Engenharia de Software e Princípios Clean Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            O núcleo operacional do TrAcEs foi implementado com foco em qualidade de software, modularidade, desacoplamento e independência tecnológica. Adotamos a <strong>Clean Architecture (Arquitetura Limpa)</strong> estruturada nas seguintes camadas:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#4A5568] list-disc pl-5">
            <li>
              <strong>Camada de Domínio (Domain):</strong> O coração do sistema, contendo as 8 entidades de regras de negócio essenciais (<code>Student</code>, <code>Teacher</code>, <code>Parent</code>, <code>Grade</code>, <code>Classroom</code>, <code>Assessment</code>, <code>Attendance</code>, <code>ReportCard</code>) e validações matemáticas puras (CPFs, e-mails, notas [0.0 a 10.0]).
            </li>
            <li>
              <strong>Camada de Aplicação (Application Services):</strong> Responsável pela orquestração do fluxo de dados, execução de regras lógicas de cálculo de médias bimestrais ponderadas, apuração de recuperação e consolidação da assiduidade anual.
            </li>
            <li>
              <strong>Camada de Infraestrutura (Infrastructure):</strong> Gerencia a persistência no banco relacional SQLite 3 transacional (12 tabelas e 11 índices) implementando o padrão <em>Repository Pattern</em>, permitindo testes unitários e de integração robustos.
            </li>
            <li>
              <strong>Camada de Exposição RESTful (API & Controllers):</strong> Servidor nativo assíncrono exposto com 18 endpoints documentados no padrão <strong>OpenAPI 3.0.3 / Swagger UI</strong>.
            </li>
            <li>
              <strong>Frontend Single Page Application (SPA):</strong> Interface reativa em React 18, TypeScript 5, Vite 6 e Tailwind CSS v4 com controle de acesso por papéis (RBAC) com 3 Modos (Pais, Docente e Desenvolvedor).
            </li>
          </ul>
        </section>

        {/* 🌱 Componente Extensionista */}
        <section className="space-y-3 border-t border-[#EEF2F7] pt-6">
          <h2 className="text-xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
            🌱 Componente Extensionista e Utilidade Social
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            O Componente Extensionista do TrAcEs valida a utilidade social do software por meio de aplicações práticas dirigidas à comunidade educacional e projetos comunitários:
          </p>
          <ol className="space-y-2.5 text-xs sm:text-sm text-[#4A5568] list-decimal pl-5">
            <li>
              <strong>Profissionalização de Escolas de Pequeno Porte e Cursos Livres:</strong> Oferece automação acadêmica confiável para instituições do interior (como a região do Cariri cearense), substituindo processos em papel ou planilhas suscetíveis a falhas matemáticas.
            </li>
            <li>
              <strong>Sustentabilidade em ONGs e Projetos Sociais:</strong> Permite comprovar a assiduidade e frequência de beneficiários aos financiadores e conselhos com relatórios de justificação transparentes.
            </li>
            <li>
              <strong>Inclusão Digital Familiar (WCAG 2.1 AA):</strong> Conformidade com diretrizes internacionais de acessibilidade (Alto Contraste nativo 7:1, zoom A+/A-, Barra de Acessibilidade fixa e Codificação Semântica Tripla) e Usabilidade (10 Heurísticas de Nielsen).
            </li>
          </ol>
        </section>

        {/* 🧪 Qualidade de Software */}
        <section className="space-y-3 border-t border-[#EEF2F7] pt-6">
          <h2 className="text-xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
            🧪 Confiabilidade e Suíte de Testes
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            A integridade das regras pedagógicas e dos contratos REST é garantida por uma suíte de <strong>79 testes automatizados no framework <code>pytest</code></strong> (100% de aprovação verde), cobrindo desde a validação de CPF até a persistência transacional SQLite.
          </p>
        </section>
      </article>
    </main>
  );
}

function parseMathExpression(expr: string): string {
  return expr
    .replace(/^\$+|\$+$/g, "")
    .replace(/\\rightarrow\s*/g, "→")
    .replace(/\\ge\s*/g, "≥")
    .replace(/\\le\s*/g, "≤")
    .replace(/\\%\s*/g, "%")
    .replace(/\\times\s*/g, "×")
    .replace(/\\longrightarrow\s*/g, "⟶");
}

function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return text;

  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\$\$?[^$]+\$\$?)/g;
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-[#1A2332]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**") &&
      part.length >= 3
    ) {
      return (
        <em key={index} className="italic font-medium text-[#1A2332]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="bg-[#EEF2F7] text-[#1B4F8A] px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B4F8A] font-semibold hover:underline"
          >
            {match[1]}
          </a>
        );
      }
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span key={index} className="font-semibold text-[#1A2332]">
          {parseMathExpression(part)}
        </span>
      );
    }
    return part;
  });
}

function SimpleMarkdownViewer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const headerRow = tableBuffer[0];
    const headers = headerRow.split("|").map((s) => s.trim()).filter(Boolean);
    const bodyRows = tableBuffer.slice(2);

    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
        <table className="w-full text-xs text-left border-collapse border border-[#CBD5E1]">
          <thead className="bg-[#FAFBFD] text-[#1A2332] border-b border-[#CBD5E1]">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-3 py-2 border-r border-[#CBD5E1] font-bold">
                  {parseInlineMarkdown(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F7]">
            {bodyRows.map((r, rIdx) => {
              const cells = r.split("|").map((s) => s.trim()).filter(Boolean);
              return (
                <tr key={rIdx} className="hover:bg-[#FAFBFD]">
                  {cells.map((c, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-r border-[#EEF2F7]">
                      {parseInlineMarkdown(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className="bg-[#1A2332] text-[#F8FAFC] p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 shadow-sm">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().startsWith("|")) {
      tableBuffer.push(line);
      return;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={idx} className="text-2xl font-bold text-[#1A2332] font-['Source_Serif_4'] mt-6 mb-3 border-b border-[#CBD5E1] pb-2">{parseInlineMarkdown(line.replace("# ", ""))}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={idx} className="text-xl font-bold text-[#1A2332] font-['Source_Serif_4'] mt-5 mb-2 border-b border-[#EEF2F7] pb-1.5">{parseInlineMarkdown(line.replace("## ", ""))}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={idx} className="text-lg font-bold text-[#1B4F8A] font-['Source_Serif_4'] mt-4 mb-2">{parseInlineMarkdown(line.replace("### ", ""))}</h3>);
    } else if (line.startsWith("#### ")) {
      elements.push(<h4 key={idx} className="text-base font-bold text-[#1A2332] mt-3 mb-1">{parseInlineMarkdown(line.replace("#### ", ""))}</h4>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={idx} className="text-xs sm:text-sm text-[#4A5568] ml-4 list-disc my-0.5">{parseInlineMarkdown(line.replace("- ", ""))}</li>);
    } else if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ")) {
      elements.push(<li key={idx} className="text-xs sm:text-sm text-[#4A5568] ml-4 list-decimal my-0.5">{parseInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>);
    } else if (line.trim() === "---") {
      elements.push(<hr key={idx} className="my-6 border-[#CBD5E1]" />);
    } else if (line.trim().length > 0) {
      elements.push(<p key={idx} className="text-xs sm:text-sm text-[#4A5568] leading-relaxed my-2">{parseInlineMarkdown(line)}</p>);
    }
  });

  flushTable();

  return <div className="space-y-1">{elements}</div>;
}

function DocsMarkdownScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const docsList = [
    { key: "EP3_README.md", title: "EP3_README.md — Guia Mestre de Execução e Arquitetura" },
    { key: "EP3_ARQUITETURA.md", title: "EP3_ARQUITETURA.md — Especificação Técnica da Arquitetura" },
    { key: "EP3_INDICE.md", title: "EP3_INDICE.md — Catálogo e Índice Executivo" },
    { key: "DESCRICAO_DO_PROJETO_pi3-ep3.md", title: "DESCRICAO_DO_PROJETO_pi3-ep3.md — Inventário Físico e Volumetria" },
    { key: "RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md", title: "RELATORIO_ATENDIMENTO_REQUISITOS-pi3-ep3.md — Atendimento de Requisitos" },
    { key: "RELATORIO_MVP_WEB_FUNCIONAL.md", title: "RELATORIO_MVP_WEB_FUNCIONAL.md — Relatório Executivo de Entrega" },
    { key: "relatorio_tecnologias_frontend_projeto.md", title: "relatorio_tecnologias_frontend_projeto.md — Especificação do Frontend" },
    { key: "relatorio-arquitetura-ep3-v1.txt", title: "relatorio-arquitetura-ep3-v1.txt — Síntese da Arquitetura em Texto" },
  ];

  const [selectedDocKey, setSelectedDocKey] = useState<string>("EP3_README.md");
  const [docContent, setDocContent] = useState<string>("Carregando documento...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/docs/pi3-ep3-atual/${selectedDocKey}`)
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error("Fallback");
      })
      .then((text) => setDocContent(text))
      .catch(() => {
        setDocContent(
          `# ${selectedDocKey}\n\nEste documento está localizado em \`docs/pi3-ep3-atual/${selectedDocKey}\`.\n\nPara visualizá-lo na íntegra, certifique-se de que o servidor backend ou estático esteja em execução.`
        );
      });
  }, [selectedDocKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDocObj = docsList.find((d) => d.key === selectedDocKey) || docsList[0];

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <BackLink label="Voltar ao Painel" onClick={() => onNavigate("integrantes")} />

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#EEF2F7] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEF2F7] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2332] font-['Source_Serif_4'] flex items-center gap-2">
              <FileText className="text-[#1B4F8A]" size={28} />
              Documentação Técnica na Íntegra
            </h1>
            <p className="text-sm text-[#6B7A8D] mt-1">
              Exibição íntegra e formatada dos documentos do diretório <code>docs/pi3-ep3-atual/</code>.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#FAFBFD] hover:bg-[#EEF2F7] text-[#1A2332] border border-[#CBD5E1] font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-2 transition-all"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Printer size={14} />}
            {copied ? "Copiado!" : "Copiar Texto Bruto"}
          </button>
        </div>

        {/* Seletor de Documentos */}
        <div className="space-y-2">
          <label htmlFor="doc-select" className="block text-xs font-bold text-[#1A2332] uppercase tracking-wide">
            Selecione o Documento para Visualizar:
          </label>
          <div className="relative">
            <select
              id="doc-select"
              value={selectedDocKey}
              onChange={(e) => setSelectedDocKey(e.target.value)}
              className="w-full bg-[#FAFBFD] border border-[#CBD5E1] text-[#1A2332] text-sm font-semibold rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              {docsList.map((doc) => (
                <option key={doc.key} value={doc.key}>
                  📄 {doc.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3.5 text-[#6B7A8D] pointer-events-none" size={18} />
          </div>
        </div>

        {/* Visualizador de Markdown */}
        <div className="p-6 rounded-xl border border-[#CBD5E1] bg-white shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3 mb-4 text-xs text-[#6B7A8D]">
            <span className="font-mono font-bold text-[#1B4F8A]">docs/pi3-ep3-atual/{selectedDocObj.key}</span>
            <span className="bg-[#EEF2F7] text-[#1A2332] px-2.5 py-0.5 rounded font-semibold">
              {docContent.split("\n").length} linhas
            </span>
          </div>

          <SimpleMarkdownViewer content={docContent} />
        </div>
      </div>
    </main>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <footer id="footer" role="contentinfo" className="mt-auto w-full bg-[#1A2332] text-white py-8 px-6 print:hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-8 mb-6">
          <div>
            <p className="font-bold text-white font-['Source_Serif_4'] text-lg mb-1">TrAcEs</p>
            <p className="text-white text-xs opacity-80">Trilha de Acompanhamento Escolar</p>
            <p className="text-white text-xs opacity-70 mt-1">Versão 1.0 MVP · WCAG 2.1 AA</p>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wide mb-2">Conformidade</p>
            <ul className="space-y-1.5 text-xs text-white opacity-80">
              <li>WCAG 2.1 Nível AA</li>
              <li>10 Heurísticas de Nielsen</li>
              <li>Clean Architecture + SQLite 3</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-4 text-xs text-white opacity-70 text-center">
          © 2026 TrAcEs — Trilha de Acompanhamento Escolar. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [highContrast, setHighContrast] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>("PARENT");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [announcement, setAnnouncement] = useState("");
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Detecção inicial de preferência do sistema operacional por Alto Contraste (WCAG 1.4.3 / 1.4.11)
    if (typeof window !== "undefined" && window.matchMedia) {
      const contrastQuery = window.matchMedia("(prefers-contrast: more)");
      if (contrastQuery.matches) {
        setHighContrast(true);
        document.documentElement.classList.add("high-contrast");
      }
      const handleContrastChange = (e: MediaQueryListEvent) => {
        setHighContrast(e.matches);
        document.documentElement.classList.toggle("high-contrast", e.matches);
      };
      contrastQuery.addEventListener?.("change", handleContrastChange);
      return () => {
        contrastQuery.removeEventListener?.("change", handleContrastChange);
      };
    }
  }, []);

  // Sincronização com a History API do Navegador, document.title e Gerenciamento Ativo de Foco (WCAG 2.4.3 / 4.1.3)
  useEffect(() => {
    // Atualização dinâmica do <title> da página
    const title = screenTitles[screen] || "TrAcEs — Trilha de Acompanhamento Estudantil";
    document.title = title;

    // Anúncio dinâmico para tecnologias assistivas via ARIA Live Region
    const pageName = title.replace(" — TrAcEs", "");
    setAnnouncement(`Página de ${pageName} carregada.`);

    // Gerenciamento Ativo de Foco: transfere o foco para o topo do novo conteúdo
    const timer = setTimeout(() => {
      mainContentRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    // Estado inicial no histórico de navegação
    if (typeof window !== "undefined" && window.history) {
      window.history.replaceState({ screen, role: activeRole }, "", window.location.href);

      const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.screen) {
          if (event.state.role) {
            setActiveRole(event.state.role);
          }
          setScreen(event.state.screen);
          setAnnouncement(screenTitles[event.state.screen as Screen] || "");
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle("high-contrast", next);
  };

  const navigate = (s: Screen) => {
    let targetScreen = s;
    if (activeRole === "TEACHER" && s !== "professor") {
      targetScreen = "professor";
    } else if (activeRole === "PARENT" && s === "professor") {
      targetScreen = "dashboard";
    } else if (
      activeRole === "DEVELOPER" &&
      !["swagger_api", "integrantes", "sobre", "docs_md"].includes(s)
    ) {
      targetScreen = "integrantes";
    }
    setScreen(targetScreen);
    setAnnouncement(screenTitles[targetScreen]);

    // Registro na History API para suporte a botões Voltar/Avançar
    if (typeof window !== "undefined" && window.history) {
      window.history.pushState({ screen: targetScreen, role: activeRole }, "", window.location.href);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const toggleRole = () => {
    const nextRole: Role =
      activeRole === "PARENT"
        ? "TEACHER"
        : activeRole === "TEACHER"
        ? "DEVELOPER"
        : "PARENT";
    setActiveRole(nextRole);
    let targetScreen: Screen = "dashboard";
    if (nextRole === "TEACHER") {
      targetScreen = "professor";
    } else if (nextRole === "DEVELOPER") {
      targetScreen = "integrantes";
    } else {
      targetScreen = "dashboard";
    }
    setScreen(targetScreen);
    setAnnouncement(screenTitles[targetScreen]);

    // Registro na History API para suporte a botões Voltar/Avançar
    if (typeof window !== "undefined" && window.history) {
      window.history.pushState({ screen: targetScreen, role: nextRole }, "", window.location.href);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    if (activeRole === "TEACHER" && screen !== "professor") {
      setScreen("professor");
    } else if (activeRole === "PARENT" && screen === "professor") {
      setScreen("dashboard");
    } else if (
      activeRole === "DEVELOPER" &&
      !["swagger_api", "integrantes", "sobre", "docs_md"].includes(screen)
    ) {
      setScreen("integrantes");
    }
  }, [activeRole, screen]);

  return (
    <div
      className={`min-h-screen flex flex-col font-['Inter'] ${
        highContrast ? "bg-black text-yellow-200" : "bg-[#EEF2F7] text-[#1A2332]"
      }`}
    >
      <div role="status" aria-live="polite" aria-atomic className="sr-only">
        {announcement}
      </div>

      <div className="sticky top-0 z-50 w-full shadow-md">
        <AccessibilityBar highContrast={highContrast} onToggleContrast={toggleContrast} />
        <Header
          onNavigate={navigate}
          currentScreen={screen}
          highContrast={highContrast}
          activeRole={activeRole}
          onToggleRole={toggleRole}
        />
      </div>

      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="flex-1 w-full py-2 outline-none focus:outline-none"
        aria-label="Conteúdo Principal"
      >
        {activeRole === "PARENT" ? (
          <>
            {screen === "dashboard" && (
              <DashboardScreen onNavigate={navigate} onSelectStudent={setSelectedStudentId} />
            )}
            {screen === "boletim" && (
              <BoletimScreen
                onNavigate={navigate}
                studentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
              />
            )}
            {screen === "notas" && (
              <NotasScreen
                onNavigate={navigate}
                studentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
              />
            )}
            {screen === "frequencia" && (
              <FrequenciaScreen
                onNavigate={navigate}
                studentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
              />
            )}
            {screen === "avisos" && (
              <AvisosScreen
                onNavigate={navigate}
                studentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
              />
            )}
          </>
        ) : activeRole === "TEACHER" ? (
          <ProfessorScreen
            onNavigate={navigate}
            onDataPublished={() => setRefreshKey((k) => k + 1)}
          />
        ) : (
          <>
            {screen === "swagger_api" && <SwaggerApiScreen onNavigate={navigate} />}
            {screen === "integrantes" && <IntegrantesScreen onNavigate={navigate} />}
            {screen === "sobre" && <SobreScreen onNavigate={navigate} />}
            {screen === "docs_md" && <DocsMarkdownScreen onNavigate={navigate} />}
          </>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
