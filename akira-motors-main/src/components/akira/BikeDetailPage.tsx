import { useState, useEffect } from "react";
import { ArrowLeft, Check, Flame, Pause } from "lucide-react";
import { bikes, logoImg } from "./data";
import { AkButton, Eyebrow, HudBracket } from "./ui";
import { cn } from "@/src/lib/utils";
import { useRouter } from "./NavigationContext";
import { sound } from "./engineSound";
import { BikeAudioPlayer } from "./BikeAudioPlayer";
import { BikeRouteCalculator } from "./BikeRouteCalculator";

export function BikeDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const [isRevving, setIsRevving] = useState(false);

  const bike = bikes.find((b) => b.slug === slug);

  useEffect(() => {
    if (!bike) return;
    const unsub = sound.subscribe((playing, src) => {
      setIsRevving(playing && src === bike.audioSrc);
    });
    return () => {
      unsub();
      sound.stopAllAudio();
    };
  }, [bike?.audioSrc]);

  if (!bike) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Moto no encontrada</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handleRev = () => {
    sound.playMechanicalClick();
    const isNowPlaying = sound.toggleRealEngineSound(bike.audioSrc, 1.0);
    setIsRevving(isNowPlaying);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground cyber-grid">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 border-b border-border/40">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Volver al inicio - Akira Motors"
          className="flex items-center cursor-pointer group"
        >
          <img
            src={logoImg}
            alt="Akira Motors"
            className="akira-brand-logo h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>
        <button
          type="button"
          onClick={() => navigate("/", "catalogo")}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </button>
      </header>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative">
          <img
            src={bike.img}
            alt={`Moto ${bike.name}`}
            className="w-full object-contain drop-shadow-2xl max-h-[500px]"
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleRev}
              className={cn(
                "clip-cyber-corner inline-flex items-center gap-2 border-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer select-none",
                isRevving
                  ? "bg-primary text-white border-primary shadow-primary/30"
                  : "bg-card border-primary/60 text-foreground hover:border-primary hover:bg-primary/10"
              )}
            >
              {isRevving ? (
                <>
                  <Pause size={15} className="animate-pulse" />
                  <span>Pausar Motor ({bike.name})</span>
                </>
              ) : (
                <>
                  <Flame size={15} className="text-primary" />
                  <span>Escuchar Rugido Real</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <Eyebrow kanji="モデル">{bike.cat} · Edición Oficial</Eyebrow>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase leading-none text-foreground">
            {bike.name}
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-bold text-sand">{bike.tagline}</p>
          <p className="mt-4 text-base font-medium text-muted-foreground leading-relaxed">
            {bike.description}
          </p>

          <div className="mt-6 p-4 rounded-none border-2 border-border bg-card">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Precio Oficial sugerido
            </p>
            <p className="font-display text-3xl font-black text-primary mt-1">
              {bike.price}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AkButton onClick={() => navigate(`/comprar/${bike.slug}`)}>
              Comprar ahora
            </AkButton>
            <AkButton
              variant="outline"
              onClick={() => navigate("/", "contacto")}
            >
              Agenda tu Test Drive
            </AkButton>
          </div>
        </div>
      </section>

      {/* 3 Metric Cards */}
      <section className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-6">
        {[
          ["Cilindrada", bike.cc],
          ["Potencia", bike.hp],
          ["Peso", bike.kg],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-none border-2 border-border bg-card p-6 text-center shadow-md relative"
          >
            <HudBracket />
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-foreground mt-1">
              {val}
            </p>
          </div>
        ))}
      </section>

      {/* Real Motorcycle Audio Sound Player Section */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <BikeAudioPlayer bike={bike} />
      </section>

      {/* Interactive Google Maps Distance, Time, Fuel and Mileage Estimator */}
      <section className="mx-auto max-w-6xl px-6">
        <BikeRouteCalculator bike={bike} />
      </section>

      {/* Features & Specifications */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="rounded-none border-2 border-border bg-card p-6 shadow-md">
          <Eyebrow kanji="特徴">Características Principales</Eyebrow>
          <ul className="space-y-3 mt-4">
            {bike.features.map((feat) => (
              <li key={feat} className="flex items-start gap-3 font-medium text-foreground">
                <Check className="mt-0.5 text-primary shrink-0" size={18} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-none border-2 border-border bg-card p-6 shadow-md">
          <Eyebrow kanji="性能">Especificaciones de Fábrica</Eyebrow>
          <dl className="divide-y divide-border mt-4">
            {bike.specs.map(([key, value]) => (
              <div key={key} className="flex justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground font-medium">{key}</dt>
                <dd className="font-bold text-foreground text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Technology & Equipment Section */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Eyebrow kanji="テクノロジー">Tecnología y equipamiento</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {bike.tech.map(([techName, techDesc]) => (
            <div
              key={techName}
              className="rounded-none border-2 border-border bg-card p-5 shadow-sm hover:border-primary transition-colors"
            >
              <p className="text-xs font-mono font-black uppercase tracking-wider text-primary">
                {techName}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground leading-snug">
                {techDesc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
