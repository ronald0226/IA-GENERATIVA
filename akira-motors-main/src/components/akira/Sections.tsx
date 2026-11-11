import { useState } from "react";
import {
  ChevronDown,
  GitCompare,
  Check,
  Instagram,
  Youtube,
  Facebook,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Gauge,
  Sparkles,
  Zap,
  Radio,
} from "lucide-react";
import { AkButton, Eyebrow, SectionTitle, HudBracket } from "./ui";
import { bikes, categories, cities, logoImg, roadImg } from "./data";
import { cn } from "@/src/lib/utils";
import { useRouter } from "./NavigationContext";
import { goTo } from "./Horizontal";
import { sound } from "./engineSound";

const specs = [
  {
    k: "Cilindrada",
    v: "1390",
    u: "cc",
    d: "Bicilíndrico en V a 75°, refrigerado por líquido de última generación con cuerpos de inyección Keihin de 56 mm.",
  },
  {
    k: "Potencia",
    v: "180",
    u: "HP",
    d: "A 10.000 rpm. Empuje lineal, despiadado y continuo hasta el corte con sincronizador quickshifter bidireccional.",
  },
  {
    k: "Torque",
    v: "145",
    u: "Nm",
    d: "A 8.000 rpm. Aceleración visceral que te pega al manillar en cualquier marcha y régimen.",
  },
  {
    k: "Peso",
    v: "199",
    u: "kg",
    d: "En orden de marcha sin combustible. Relación peso-potencia inigualable en chasis trellis cromo-molibdeno.",
  },
  {
    k: "Modos de manejo",
    v: "4",
    u: "modos",
    d: "Rain · Street · Sport · Track con telemetría en tiempo real y telemetría de ángulos de inclinación en pantalla TFT de 5\".",
  },
];

export function Specs() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-16 lg:py-0">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1.3fr] items-center">
        <div>
          <Eyebrow kanji="仕様">Ficha técnica · AKR 1390</Eyebrow>
          <SectionTitle>Siente la potencia</SectionTitle>
          <p className="mt-5 max-w-md text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
            Rendimiento de competición calibrado para quienes no se conforman con lo ordinario.
            Cada cifra es una descarga de adrenalina al girar el puño.
          </p>

          {/* Cyberpunk Telemetry Gauge (Visual Telemetry without audio on home page) */}
          <div className="mt-6 rounded-none border-2 border-border bg-card p-4 shadow-sm relative overflow-hidden">
            <HudBracket />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                  <Radio size={13} className="animate-pulse" /> Telemetría V-Twin 75°
                </span>
                <p className="font-display text-2xl font-black text-foreground tabular-nums">
                  1.400 <span className="text-xs font-mono text-muted-foreground font-semibold">RPM (Ralentí)</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-mono font-black border border-primary/30">
                10.500 RPM CORTE
              </span>
            </div>

            {/* Tachometer bar */}
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-primary transition-all duration-300"
                style={{ width: "22%" }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-mono text-muted-foreground font-bold">
              <span>0 RPM</span>
              <span>8.000 (PAR MÁX)</span>
              <span className="text-primary">10.500 (CORTE)</span>
            </div>
          </div>

          {/* High contrast badges */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-foreground">
            <span className="flex items-center gap-1.5 text-primary">
              <ShieldCheck size={16} /> 3 años garantía oficial
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Gauge size={16} className="text-primary" /> Telemetría integrada
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Zap size={16} className="text-primary" /> Quickshifter +
            </span>
          </div>
        </div>

        {/* Clean Modular Spec List (No Hotspots) */}
        <ul className="divide-y divide-border border-2 border-border bg-card rounded-none p-4 sm:p-5 shadow-md">
          {specs.map((s, i) => (
            <li key={s.k}>
              <button
                type="button"
                onClick={() => {
                  sound.playMechanicalClick();
                  setOpen(i === open ? -1 : i);
                }}
                className="flex w-full items-center justify-between py-4 text-left cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {s.k}
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-display text-2xl sm:text-3xl font-black text-foreground">
                    {s.v}
                    <span className="ml-1 text-sm font-bold text-primary">
                      {s.u}
                    </span>
                  </span>
                  <ChevronDown
                    size={20}
                    className={cn(
                      "transition-transform duration-300 text-muted-foreground group-hover:text-primary",
                      open === i && "rotate-180 text-primary"
                    )}
                  />
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open === i ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <p className="overflow-hidden text-sm font-medium text-muted-foreground leading-relaxed">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Catalog() {
  const [cat, setCat] = useState<(typeof categories)[number]>("Todas");
  const [compare, setCompare] = useState<string[]>([]);
  const { navigate } = useRouter();

  const list = bikes.filter((b) => cat === "Todas" || b.cat === cat);

  return (
    <div className="w-full py-20 lg:pt-16 lg:pb-0">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow kanji="製品カタログ">Catálogo Oficial · Akira Motors</Eyebrow>
            <SectionTitle>Elige tu territorio</SectionTitle>
          </div>
          
          {/* Cyberpunk Filter Tabs with High Contrast */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  sound.playMechanicalClick();
                  setCat(c);
                }}
                className={cn(
                  "clip-cyber-corner border-2 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((b) => {
            const on = compare.includes(b.name);
            return (
              <article
                key={b.name}
                onMouseEnter={() => sound.playHoverRumble()}
                className="group relative overflow-hidden rounded-none border-2 border-border bg-card transition-all duration-300 hover:border-primary hover:shadow-xl flex flex-col justify-between"
              >
                <div
                  onClick={() => navigate(`/motos/${b.slug}`)}
                  className="relative block aspect-[4/3] overflow-hidden bg-background/50 cursor-pointer"
                >
                  <img
                    src={b.img}
                    alt={`Moto ${b.name}`}
                    loading="lazy"
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Category Pill with High Contrast */}
                  <span className="absolute left-3 top-3 rounded-none bg-background px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border border-border text-foreground shadow-xs">
                    {b.cat}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-around bg-background/95 py-2.5 backdrop-blur transition-transform duration-300 group-hover:translate-y-0 border-t border-border">
                    {[b.cc, b.hp, b.kg].map((v) => (
                      <span
                        key={v}
                        className="font-display text-xs font-black text-foreground"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 p-4">
                  <div className="w-full">
                    <h3 className="font-display text-lg font-black text-foreground leading-tight">
                      {b.name}
                    </h3>
                    <p className="text-sm font-black text-primary mt-1">{b.price}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1 font-medium">
                      {b.tagline}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 pt-1">
                    {/* Primary Direct Action Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/motos/${b.slug}`)}
                      className="clip-cyber-corner w-full bg-primary px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-primary-foreground hover:bg-primary-deep transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      Ver Detalles <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playMechanicalClick();
                        setCompare((c) =>
                          on ? c.filter((n) => n !== b.name) : [...c, b.name].slice(-2)
                        );
                      }}
                      className={cn(
                        "clip-cyber-corner flex items-center justify-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer w-full",
                        on
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      {on ? <Check size={13} /> : <GitCompare size={13} />} Comparar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {compare.length === 2 && (
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-none border-2 border-primary bg-card p-5 text-sm backdrop-blur-md animate-in fade-in shadow-xl">
            <div className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider text-primary font-black">
                Comparación directa
              </span>
              <p className="text-xs text-muted-foreground font-medium">Ficha técnica frente a frente</p>
            </div>
            {compare.map((n) => {
              const b = bikes.find((x) => x.name === n)!;
              return (
                <div key={n} className="border-l border-border pl-4">
                  <p className="font-display font-black text-foreground">{n}</p>
                  <p className="text-xs text-primary font-black mt-0.5">{b.price}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {b.cc} · {b.hp} · {b.kg}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/motos/${b.slug}`)}
                    className="mt-2 text-xs text-primary underline underline-offset-4 font-bold hover:text-primary-deep cursor-pointer"
                  >
                    Ficha completa →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function Brand() {
  return (
    <div className="relative flex h-full w-full flex-col justify-center items-center overflow-hidden px-6 py-8 sm:py-12 lg:py-0 cyber-grid">
      <img
        src={roadImg}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-10 dark:opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Eyebrow kanji="哲学・探検家">ADN Akira · Arquetipo El Explorador</Eyebrow>
        
        <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-black uppercase leading-tight text-foreground mt-2">
          No construimos vehículos para encajar en la ciudad. Diseñamos{" "}
          <span className="text-primary underline decoration-primary/40 underline-offset-8">
            máquinas para redibujar el mapa.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
          En Akira Motors, cada curva es un reto y cada aceleración es una declaración de libertad.
          La ingeniería japonesa de precisión se une a la audacia del diseño contemporáneo para darte
          el control absoluto en cada kilómetro.
        </p>

        {/* High Contrast Stat Indicators - Updated with Colombia Dealerships */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-lg relative max-w-3xl mx-auto">
          <HudBracket />
          <div>
            <p className="font-display text-3xl sm:text-4xl font-black text-foreground">
              12
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">
              Años en ruta
            </p>
          </div>
          <div className="border-y sm:border-y-0 sm:border-x border-border py-2 sm:py-0">
            <p className="font-display text-2xl sm:text-3xl font-black text-primary">
              +250
            </p>
            <p className="text-xs uppercase tracking-widest text-foreground mt-1.5 font-black">
              Concesionarios en toda Colombia
            </p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl font-black text-foreground">
              210K
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1.5 font-bold">
              Pilotos en ruta
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs font-mono font-bold uppercase tracking-wider text-primary">
          Más de 250 concesionarios en toda Colombia con servicio técnico oficial
        </p>
      </div>
    </div>
  );
}

export function Contact() {
  const [step, setStep] = useState(0);
  const [model, setModel] = useState("AKR 1390");
  const [city, setCity] = useState("Bogotá");
  const [type, setType] = useState("Test Drive");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const inputClass =
    "w-full rounded-none border-2 border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors font-medium";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 lg:py-0">
      <div>
        <Eyebrow kanji="正規ディーラー">Concesionarios y Test Drive</Eyebrow>
        <SectionTitle>Configura tu ruta</SectionTitle>

        <div className="mt-6 flex gap-2">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-none transition-colors",
                step >= i ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        {sent ? (
          <div className="mt-8 rounded-none border-2 border-primary bg-card p-8 text-center shadow-xl animate-in fade-in relative">
            <HudBracket />
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-none border border-primary bg-primary/20 text-primary">
              <Sparkles size={24} />
            </div>
            <p className="font-display text-2xl font-black text-foreground">
              Despegue confirmado.
            </p>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto font-medium">
              Gracias <strong className="text-foreground">{fullName || "piloto"}</strong>. Un especialista en ruta de{" "}
              <strong className="text-foreground">{city}</strong> te contactará en las próximas 24 horas a{" "}
              <strong className="text-foreground">{email}</strong> para coordinar tu{" "}
              <span className="text-primary font-bold">{type.toLowerCase()}</span> de la{" "}
              <strong className="text-foreground">{model}</strong>.
            </p>
            <div className="mt-6">
              <AkButton
                variant="outline"
                onClick={() => {
                  setSent(false);
                  setStep(0);
                }}
              >
                Hacer otra solicitud
              </AkButton>
            </div>
          </div>
        ) : step === 0 ? (
          <div className="mt-6 space-y-5">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Paso 1 · Elige tu máquina
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {bikes.map((b) => (
                <button
                  type="button"
                  key={b.name}
                  onClick={() => {
                    sound.playMechanicalClick();
                    setModel(b.name);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-none border-2 p-4 text-left transition-all cursor-pointer bg-card",
                    model === b.name
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-foreground/50"
                  )}
                >
                  <img src={b.img} alt={b.name} className="h-10 w-14 object-contain" />
                  <div>
                    <p className="font-display font-black text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {b.cat} · {b.cc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-2">
              <AkButton
                type="button"
                disabled={!model}
                onClick={() => setStep(1)}
                className="gap-2"
              >
                Continuar a Datos <ArrowRight size={16} />
              </AkButton>
            </div>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Paso 2 · Concesionario y solicitud para {model}
              </p>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-xs text-primary underline underline-offset-4 cursor-pointer font-bold"
              >
                Cambiar moto
              </button>
            </div>

            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={cn(inputClass, "pl-11 cursor-pointer")}
              >
                <option value="">Selecciona concesionario oficial en Colombia</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    Akira Center {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {["Test Drive", "Cotización"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    sound.playMechanicalClick();
                    setType(t);
                  }}
                  className={cn(
                    "clip-cyber-corner flex-1 border-2 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer",
                    type === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              maxLength={80}
              className={inputClass}
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico (ej. nombre@correo.com)"
              maxLength={120}
              className={inputClass}
            />

            <div className="flex gap-3 pt-2">
              <AkButton
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
              >
                Atrás
              </AkButton>
              <AkButton type="submit">
                Confirmar {type}
              </AkButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [subEmail, setSubEmail] = useState("");

  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Akira Motors"
              className="akira-brand-logo h-8 w-auto object-contain"
            />
            <span className="font-display font-black text-sm tracking-wider text-foreground">
              AKIRA <span className="text-primary font-bold">MOTORS</span>
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground leading-relaxed">
            Supera el límite de lo convencional. Potencia y diseño sin concesiones.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Youtube, Facebook].map((IconComp, i) => (
              <a
                key={i}
                href="#"
                aria-label="Red social"
                className="grid h-9 w-9 place-items-center rounded-none border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-background"
              >
                <IconComp size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground font-black">
            Mapa del sitio
          </p>
          {[
            ["AKR 1390", "akr1390"],
            ["Catálogo", "catalogo"],
            ["Experiencia", "experiencia"],
            ["Concesionarios", "contacto"],
          ].map(([label, id]) => (
            <p key={id} className="py-1">
              <button
                type="button"
                onClick={() => goTo(id)}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {label}
              </button>
            </p>
          ))}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground font-black">
            Red Oficial en Colombia
          </p>
          {cities.map((c) => (
            <p key={c} className="py-1 text-sm font-medium text-muted-foreground">
              {c} · Concesionario Oficial
            </p>
          ))}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground font-black">
            Novedades Exclusivas
          </p>
          {subscribed ? (
            <p className="text-sm text-primary font-black">
              ¡Gracias por suscribirte al club Akira!
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (subEmail) setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-none border-2 border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary text-foreground font-medium"
              />
              <AkButton className="mt-3 w-full text-xs">Suscribirme</AkButton>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 text-center text-xs font-medium text-muted-foreground">
        © 2026 Akira Motors · Todos los derechos reservados · Términos · Privacidad · Cookies
      </div>
    </footer>
  );
}
