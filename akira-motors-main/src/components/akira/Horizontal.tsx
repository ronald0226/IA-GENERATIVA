import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronRight } from "lucide-react";
import { bikes } from "./data";
import { Specs, Catalog, Brand, Contact } from "./Sections";
import { sound } from "./engineSound";

export const PANELS = [
  "inicio",
  "akr1390",
  "catalogo",
  "experiencia",
  "contacto",
] as const;

/** Scroll target for each panel, filled once the timeline is built. */
export const panelScroll: Record<string, number> = {};

export function goTo(id: string) {
  sound.stopAllAudio();
  const y = panelScroll[id];
  if (y !== undefined && window.innerWidth >= 1024) {
    window.scrollTo({ top: y, behavior: "smooth" });
  } else if (id === "inicio") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

function Panel({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex min-h-[100svh] w-full shrink-0 items-center overflow-hidden lg:h-[100svh] lg:w-screen ${className}`}
    >
      {children}
    </section>
  );
}

export function HorizontalPage() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const n = PANELS.length;
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      tl.addLabel("inicio", 0);
      tl.fromTo(
        "[data-bike]",
        { xPercent: -130, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 1, ease: "power2.out" }
      );
      tl.fromTo("[data-hint]", { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0);
      tl.to({}, { duration: 0.4 });

      for (let i = 1; i < n; i++) {
        tl.to(track.current, {
          xPercent: (-100 * i) / n,
          duration: 1,
          ease: "power2.inOut",
        });
        tl.addLabel(PANELS[i]!);
        tl.to({}, { duration: 0.6 });
      }

      const st = ScrollTrigger.create({
        trigger: wrap.current,
        pin: true,
        animation: tl,
        scrub: 0.8,
        start: "top top",
        end: () => "+=" + window.innerHeight * tl.duration() * 1.2,
        invalidateOnRefresh: true,
        onUpdate: (s) => setProgress(s.progress),
        onRefresh: (s) => {
          PANELS.forEach((p) => {
            const t = p === "inicio" ? 0 : (tl.labels[p] ?? 0) + 0.3;
            panelScroll[p] = s.start + (s.end - s.start) * (t / tl.duration());
          });
        },
      });

      return () => {
        st.kill();
        PANELS.forEach((p) => delete panelScroll[p]);
      };
    });

    mm.add("(max-width: 1023px)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });

      // Hint fades out smoothly as scroll starts
      tl.to("[data-hint]", { opacity: 0, duration: 0.3 }, 0);

      // The motorcycle ENTERS from off-screen into its centered position
      tl.fromTo(
        "[data-bike]",
        { xPercent: -150, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
        },
        0
      );

      // Brief hold buffer with the bike fully in place before continuing the scroll
      tl.to({}, { duration: 0.6 });

      // Pinned hero with generous scroll distance (2.2x viewport) and smooth scrub damping
      const st = ScrollTrigger.create({
        trigger: "#inicio",
        pin: true,
        pinSpacing: true,
        animation: tl,
        scrub: 1.2,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 2.2),
        invalidateOnRefresh: true,
      });

      return () => {
        st.kill();
        tl.kill();
      };
    });

    gsap.from("[data-intro]", {
      y: 60,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
    });

    return () => mm.revert();
  }, []);

  const heroBike = bikes[0];

  return (
    <div ref={wrap} className="relative lg:h-[100svh] lg:overflow-hidden">
      <div
        ref={track}
        className="flex h-full w-full flex-col lg:w-[500vw] lg:flex-row"
      >
        {/* 1 · Página principal: moto a la izquierda, texto a la derecha */}
        <Panel id="inicio" className="cyber-grid">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_60%,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_60%)]" />
          
          {/* Subtle Cyberpunk Japanese Background Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 font-display text-[16vw] font-black tracking-tighter text-foreground/[0.03] select-none leading-none"
          >
            アキラ
          </div>

          <div className="relative grid w-full items-center gap-6 px-6 pt-24 pb-10 lg:grid-cols-[1.3fr_1fr] lg:px-16 lg:pt-16 lg:pb-0">
            <div className="relative order-2 lg:order-1 flex justify-center">
              <img
                data-bike
                src={heroBike.img}
                alt="Moto Akira AKR 1390 blanca y roja"
                width={1620}
                height={970}
                className="w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)] max-h-[40svh] object-contain select-none lg:max-h-[70vh]"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <div
                data-intro
                className="mb-2 inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-bold tracking-widest text-primary uppercase"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                NEO-TOKYO 2026 · EXP_01
              </div>
              <h1
                data-intro
                className="font-display text-[clamp(3.5rem,10vw,8.5rem)] font-black leading-[0.85] tracking-tight text-foreground"
              >
                AKR
                <br />
                <span className="text-transparent [-webkit-text-stroke:2px_var(--color-foreground)]">
                  1390
                </span>
              </h1>
              <p
                data-intro
                className="mt-5 max-w-sm text-base sm:text-lg text-muted-foreground leading-relaxed font-medium"
              >
                El camino no está trazado.{" "}
                <strong className="text-foreground font-black">
                  Lo defines tú.
                </strong>
              </p>
              
              <div data-intro className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => goTo("akr1390")}
                  className="clip-cyber-corner inline-flex items-center gap-3 bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-deep transition-all duration-200 shadow-[0_8px_20px_-6px_var(--color-primary)] active:translate-y-0.5 cursor-pointer"
                >
                  Desbloquea la AKR 1390 <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo("catalogo")}
                  className="clip-cyber-corner inline-flex items-center gap-2 border-2 border-foreground/30 bg-background/80 px-5 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground hover:border-primary hover:text-primary transition-all duration-200 active:translate-y-0.5 cursor-pointer"
                >
                  Ver Catálogo <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <p
            data-hint
            className="absolute bottom-12 left-6 flex items-center gap-3 text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground lg:left-16"
          >
            <span>Haz scroll hacia abajo para explorar</span>
            <ArrowRight className="animate-pulse text-primary" size={18} />
          </p>
        </Panel>

        {/* 2 · Ficha técnica / Specs */}
        <Panel id="akr1390">
          <Specs />
        </Panel>

        {/* 3 · Catálogo */}
        <Panel id="catalogo" className="bg-card/90 dark:bg-card/40 border-y border-border">
          <Catalog />
        </Panel>

        {/* 4 · Experiencia / ADN Akira */}
        <Panel id="experiencia" className="overflow-hidden">
          <Brand />
        </Panel>

        {/* 5 · Concesionarios y Contacto */}
        <Panel id="contacto" className="bg-card/90 dark:bg-card/50 border-t border-border">
          <Contact />
        </Panel>
      </div>

      {/* Indicador de progreso horizontal (en pantallas grandes) */}
      <div className="pointer-events-none absolute inset-x-16 bottom-6 hidden items-center gap-4 lg:flex z-20">
        <div className="h-0.5 flex-1 bg-border/60 overflow-hidden rounded-full">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
        <span className="font-display text-xs font-bold tabular-nums text-muted-foreground">
          0{Math.min(PANELS.length, Math.round(progress * (PANELS.length - 1)) + 1)} / 0
          {PANELS.length}
        </span>
      </div>
    </div>
  );
}
