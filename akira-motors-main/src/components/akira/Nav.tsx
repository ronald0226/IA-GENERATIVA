import { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Menu,
  X,
  Volume2,
  VolumeX,
  User,
  LogOut,
  UserCheck,
  ChevronRight,
  Gauge,
  Bike,
  Navigation,
  MapPin,
  Home,
} from "lucide-react";
import { goTo } from "./Horizontal";
import { logoImg } from "./data";
import { useRouter } from "./NavigationContext";
import { sound } from "./engineSound";
import { useAuth } from "./AuthContext";
import { HudBracket } from "./ui";
import { cn } from "@/src/lib/utils";

interface NavLinkItem {
  id: string;
  num: string;
  label: string;
  desc: string;
  icon: typeof Bike;
}

const navLinks: NavLinkItem[] = [
  {
    id: "inicio",
    num: "01",
    label: "Inicio",
    desc: "Portada principal y presentación",
    icon: Home,
  },
  {
    id: "akr1390",
    num: "02",
    label: "AKR 1390",
    desc: "Hyper-Naked Flagship · 180 HP",
    icon: Bike,
  },
  {
    id: "catalogo",
    num: "03",
    label: "Catálogo",
    desc: "Sport, Enduro, Motocross & Adventure",
    icon: Gauge,
  },
  {
    id: "experiencia",
    num: "04",
    label: "Experiencia",
    desc: "Telemetría, Rutas Google Maps & Sonido Real",
    icon: Navigation,
  },
  {
    id: "contacto",
    num: "05",
    label: "Concesionarios",
    desc: "Red Oficial de Distribución Akira",
    icon: MapPin,
  },
];

export function Nav() {
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(sound.getMuted());
  const { path, navigate } = useRouter();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  // Dark/Light theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  // Lock body scroll when mobile hamburger drawer is active
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleNavClick = (panelId: string) => {
    setOpen(false);
    sound.playMechanicalClick();
    if (path !== "/") {
      navigate("/", panelId);
    } else {
      goTo(panelId);
    }
  };

  const handleSoundToggle = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <>
      {/* =========================================================================
          TOP NAVBAR
          - Desktop (>=1024px): Complete horizontal menu with section links
          - Mobile / Tablet (<1024px): Clean header with brand logo & hamburger
      ========================================================================= */}
      <header className="fixed inset-x-0 top-0 sm:top-3 z-40 px-2 sm:px-4 md:px-6 transition-all duration-300">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex max-w-7xl items-center justify-between rounded-none border-b-2 sm:border-2 border-border/80 bg-background/95 sm:bg-background/90 px-3.5 sm:px-5 py-2 sm:py-2.5 backdrop-blur-xl shadow-xl shadow-black/25"
        >
          {/* Brand Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("inicio");
            }}
            aria-label="Akira Motors - Inicio"
            className="flex items-center shrink-0 cursor-pointer group py-1"
          >
            <img
              src={logoImg}
              alt="Akira Motors"
              className="akira-brand-logo h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Center Links (Desktop only: lg and above) */}
          <ul className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(id);
                  }}
                  className="relative text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground hover:text-primary cursor-pointer py-1.5"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop / Tablet Utility Buttons: Sound Engine & Theme */}
            <button
              type="button"
              aria-label={muted ? "Activar sonido de motor" : "Silenciar sonido de motor"}
              title={muted ? "Activar sonido de motor" : "Silenciar sonido de motor"}
              onClick={handleSoundToggle}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-none border-2 border-border hover:border-primary text-foreground transition-colors cursor-pointer bg-card/60"
            >
              {muted ? (
                <VolumeX size={15} className="text-muted-foreground" />
              ) : (
                <Volume2 size={15} className="text-primary animate-pulse" />
              )}
            </button>

            <button
              type="button"
              aria-label="Cambiar tema de color"
              onClick={() => setLight((v) => !v)}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-none border-2 border-border hover:border-primary text-foreground transition-colors cursor-pointer bg-card/60"
            >
              {light ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Desktop Auth Badge or Login Button */}
            {isAuthenticated && user ? (
              <div className="hidden lg:inline-flex items-center gap-2 h-9 px-3 rounded-none border-2 border-primary/50 bg-primary/10 text-xs font-mono">
                <UserCheck size={13} className="text-primary shrink-0" />
                <span className="font-bold text-foreground truncate max-w-[90px]">
                  {user.primerNombre}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión de piloto"
                  aria-label="Cerrar sesión de piloto"
                  className="ml-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playMechanicalClick();
                  openAuthModal("login");
                }}
                className="hidden lg:inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-none border-2 border-foreground/30 bg-background/60 hover:border-primary hover:text-primary active:translate-y-0.5 text-xs font-bold uppercase tracking-wider text-foreground transition-all duration-200 cursor-pointer clip-cyber-corner"
              >
                <User size={13} />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Desktop Test Drive CTA */}
            <button
              type="button"
              onClick={() => {
                sound.playMechanicalClick();
                handleNavClick("contacto");
              }}
              className="hidden lg:inline-flex items-center justify-center h-9 px-3.5 rounded-none bg-primary text-primary-foreground hover:bg-primary-deep active:translate-y-0.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer clip-cyber-corner shadow-sm shadow-primary/20"
            >
              <span>Agenda tu Test Drive</span>
            </button>

            {/* MOBILE & TABLET HAMBURGER BUTTON (Mobile-First >=44px touch target) */}
            <button
              type="button"
              aria-label={open ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              aria-expanded={open}
              onClick={() => {
                sound.playMechanicalClick();
                setOpen((prev) => !prev);
              }}
              className={cn(
                "min-h-[44px] min-w-[44px] h-11 w-11 grid place-items-center rounded-none border-2 transition-all cursor-pointer lg:hidden",
                open
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_-3px_var(--color-primary)]"
                  : "border-border/90 bg-card hover:border-primary text-foreground"
              )}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          SIMPLIFIED HAMBURGER MENU DRAWER
          - Exclusively displays the sections of the page
          - Clean, high-contrast, distraction-free
          - Touch target compliant (>=44px), backdrop dismiss, Escape key dismiss
      ========================================================================= */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación de secciones Akira Motors"
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
        >
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200 cursor-pointer"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative w-full sm:w-[380px] max-w-[100vw] h-full bg-background border-l-2 border-primary/50 shadow-2xl flex flex-col p-6 sm:p-7 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300 z-10">
            <HudBracket />

            {/* Drawer Header: Brand Logo & Close */}
            <div className="flex items-center justify-between pb-5 border-b-2 border-border/80">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="Akira Motors"
                  className="akira-brand-logo h-8 w-auto object-contain"
                />
                <span className="text-[10px] font-mono tracking-widest text-primary font-bold uppercase">
                  SECCIONES DEL PORTAL
                </span>
              </div>

              {/* Close Button - min 44px */}
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => {
                  sound.playMechanicalClick();
                  setOpen(false);
                }}
                className="min-h-[44px] min-w-[44px] h-11 w-11 grid place-items-center rounded-none border-2 border-border hover:border-primary text-foreground transition-colors cursor-pointer bg-card"
              >
                <X size={20} />
              </button>
            </div>

            {/* SECTIONS OF THE PAGE ONLY */}
            <nav
              className="flex-1 py-6 space-y-2.5"
              aria-label="Secciones de la página Akira Motors"
            >
              {navLinks.map(({ id, num, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavClick(id)}
                  className="w-full min-h-[56px] px-4 py-3 text-left rounded-none border-2 border-border/70 bg-card/50 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 grid place-items-center border border-border group-hover:border-primary text-muted-foreground group-hover:text-primary transition-colors bg-background shrink-0">
                      <Icon size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#D4232D]">
                          {num}
                        </span>
                        <span className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                          {label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
                        {desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={17}
                    className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2"
                  />
                </button>
              ))}
            </nav>

            {/* Clean bottom brand badge */}
            <div className="pt-4 border-t-2 border-border/80 text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                NEO TOKYO 2026 · CIRCUITO OFICIAL
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
