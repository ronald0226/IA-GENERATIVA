import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, Rocket, X, ShieldAlert, LogIn, CheckCircle2, UserCheck } from "lucide-react";
import { bikes, cities, colors, paymentMethods, logoImg } from "./data";
import { AkButton, Eyebrow, HudBracket } from "./ui";
import { useRouter } from "./NavigationContext";
import { useAuth } from "./AuthContext";
import { validateBuyerForm, type BuyerFormInput } from "./logic";
import { sound } from "./engineSound";

export function ComprarPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bike = bikes.find((b) => b.slug === slug) || bikes[0];

  const [form, setForm] = useState<BuyerFormInput & { color: string; pago: string }>({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    color: colors[0],
    pago: paymentMethods[0],
    terminos: false,
  });

  // Auto-fill from authenticated user profile if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        nombre: prev.nombre || user.nombreCompleto,
        documento: prev.documento || user.documento,
        email: prev.email || user.email,
        telefono: prev.telefono || user.telefono,
        ciudad: prev.ciudad || user.ciudad,
      }));
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Check requirement 2: User must be logged in before purchasing
    if (!isAuthenticated) {
      sound.playMechanicalClick();
      setShowAuthGateModal(true);
      return;
    }

    const validationErrors = validateBuyerForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    sound.playMechanicalClick();
    setOpenSuccessModal(true);
  };

  const handleOpenLoginFromModal = () => {
    setShowAuthGateModal(false);
    openAuthModal("login");
  };

  const inputClass =
    "w-full rounded-none border-2 border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors font-medium";

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

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground border-2 border-border/70 px-3 py-1.5 rounded-none bg-card">
              <UserCheck size={14} className="text-primary" />
              <span>Piloto: <strong className="text-foreground">@{user.usuario}</strong></span>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate(`/motos/${bike.slug}`)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Volver a la moto
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[1fr_1.3fr] pt-6">
        {/* Left Aside: Order Summary - Sharp Borders */}
        <aside className="h-fit rounded-none border-2 border-border bg-card p-6 shadow-md relative lg:sticky lg:top-6">
          <HudBracket />
          <Eyebrow kanji="注文">Tu pedido</Eyebrow>
          <img
            src={bike.img}
            alt={`Moto ${bike.name}`}
            className="w-full object-contain max-h-[260px] my-2"
          />
          <h1 className="mt-4 font-display text-3xl font-black uppercase text-foreground">
            {bike.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {bike.cat} · {bike.cc} · {bike.hp}
          </p>

          <div className="mt-4 space-y-2 border-t border-border/80 pt-4 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Garantía oficial:</span>
              <span className="font-bold text-foreground">3 años sin límite</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Telemetría:</span>
              <span className="font-bold text-foreground">Módulo GPS/TFT 5"</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Color seleccionado:</span>
              <span className="font-bold text-primary">{form.color}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center border-t-2 border-border pt-4">
            <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">
              Total Oficial
            </span>
            <span className="font-display text-2xl font-black text-foreground">
              {bike.price}
            </span>
          </div>

          {!isAuthenticated && (
            <div className="mt-5 border-2 border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <span className="font-bold block uppercase tracking-wider text-amber-300">
                Aviso para compradores:
              </span>
              Al hacer clic en "Finalizar compra", se solicitará tu inicio de sesión de piloto.
            </div>
          )}
        </aside>

        {/* Right Form: Buyer Details - Sharp Borders */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="flex items-center justify-between">
            <Eyebrow kanji="購入">Datos del comprador</Eyebrow>
            {isAuthenticated ? (
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Sesión activa
              </span>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <LogIn size={13} /> Ya tengo cuenta
              </button>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Nombre completo *
              </label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                maxLength={100}
                placeholder="Nombre y apellidos"
                className={inputClass}
              />
              {errors.nombre && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.nombre}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Cédula / Documento *
              </label>
              <input
                name="documento"
                value={form.documento}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                  setForm({ ...form, documento: onlyNums });
                }}
                inputMode="numeric"
                maxLength={12}
                placeholder="Número de cédula (solo números)"
                className={inputClass}
              />
              {errors.documento && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.documento}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Correo Electrónico *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                maxLength={255}
                placeholder="correo@ejemplo.com"
                className={inputClass}
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Teléfono Móvil *
              </label>
              <input
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
                maxLength={15}
                placeholder="+57 300 000 0000"
                className={inputClass}
              />
              {errors.telefono && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.telefono}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Ciudad de entrega *
              </label>
              <select
                name="ciudad"
                value={form.ciudad}
                onChange={(e) =>
                  setForm({ ...form, ciudad: e.target.value })
                }
                className={inputClass}
              >
                <option value="" disabled>
                  Selecciona una ciudad…
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.ciudad && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.ciudad}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Dirección de residencia *
              </label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
                maxLength={200}
                placeholder="Dirección completa"
                className={inputClass}
              />
              {errors.direccion && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {errors.direccion}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Color de carenaje
              </label>
              <select
                name="color"
                value={form.color}
                onChange={(e) =>
                  setForm({ ...form, color: e.target.value })
                }
                className={inputClass}
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Forma de pago
              </label>
              <select
                name="pago"
                value={form.pago}
                onChange={(e) =>
                  setForm({ ...form, pago: e.target.value })
                }
                className={inputClass}
              >
                {paymentMethods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="terminos"
                checked={form.terminos}
                onChange={(e) =>
                  setForm({ ...form, terminos: e.target.checked })
                }
                className="h-4 w-4 rounded-none border-border accent-primary cursor-pointer"
              />
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                Acepto los términos y condiciones de compraventa y reserva en Akira Motors
              </span>
            </label>
            {errors.terminos && (
              <span className="mt-1 block text-xs text-destructive font-medium">
                {errors.terminos}
              </span>
            )}
          </div>

          <AkButton type="submit" className="w-full py-4 text-sm tracking-widest">
            Finalizar compra
          </AkButton>
        </form>
      </div>

      {/* MODAL 1: AUTH REQUIRED INFORMATIVE MODAL (Requirement 2) */}
      {showAuthGateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-none border-2 border-primary bg-card p-6 sm:p-10 text-center shadow-2xl animate-in zoom-in-95">
            <HudBracket />
            
            <button
              type="button"
              aria-label="Cerrar modal informativo"
              onClick={() => setShowAuthGateModal(false)}
              className="absolute right-4 top-4 rounded-none border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-primary bg-primary/10 text-primary mb-4">
              <ShieldAlert size={34} className="animate-pulse" />
            </div>

            <Eyebrow kanji="認証要求">Autenticación Requerida</Eyebrow>

            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-foreground leading-tight">
              Inicia sesión para comprar
            </h2>

            <p className="mt-3 text-sm text-muted-foreground font-medium leading-relaxed">
              Antes de formalizar la compra de tu{" "}
              <strong className="text-foreground">{bike.name}</strong>, debes realizar el
              proceso de <span className="text-primary font-bold">login</span> o registrar tu
              cuenta oficial de piloto en Akira Motors.
            </p>

            <div className="mt-4 border-2 border-border/80 bg-background/60 p-3.5 text-left text-xs font-mono text-muted-foreground">
              <p className="text-foreground font-bold mb-1">¿Por qué es obligatorio?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Asociar la titularidad y garantía de 3 años a tu perfil.</li>
                <li>Vincular la telemetría en tiempo real y soporte técnico.</li>
                <li>Emitir la reserva oficial con entrega en concesionario.</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <AkButton
                variant="outline"
                onClick={() => setShowAuthGateModal(false)}
                className="w-full sm:w-auto"
              >
                Volver al pedido
              </AkButton>
              <AkButton
                onClick={handleOpenLoginFromModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Ir al Login / Registro
              </AkButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUCCESS DIALOG MODAL (Sharp Borders) */}
      {openSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-2xl rounded-none border-2 border-primary bg-card p-8 text-center shadow-2xl sm:p-12 animate-in zoom-in-95">
            <HudBracket />
            
            <button
              type="button"
              aria-label="Cerrar modal"
              onClick={() => setOpenSuccessModal(false)}
              className="absolute right-4 top-4 rounded-none border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <Rocket className="mx-auto text-primary" size={56} />
            <Eyebrow kanji="確定">Orden Registrada</Eyebrow>

            <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] font-black uppercase leading-none mt-2 text-foreground">
              ¡Gracias por tu compra!
            </h2>

            <p className="mt-2 text-sm sm:text-base text-foreground font-medium">
              Piloto: <strong className="text-primary font-black">{form.nombre}</strong> (
              {user?.riderCode || "AKR-PILOT"})
            </p>

            <div className="mt-5 rounded-none border-2 border-border bg-background/80 p-4 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Modelo reservado:</span>
                <span className="font-bold text-foreground">{bike.name} ({form.color})</span>
              </div>
              <div className="flex justify-between border-b border-border/60 py-1.5">
                <span className="text-muted-foreground">Ciudad de entrega:</span>
                <span className="font-bold text-foreground">{form.ciudad}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 py-1.5">
                <span className="text-muted-foreground">Forma de pago:</span>
                <span className="font-bold text-foreground">{form.pago}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary text-sm">{bike.price}</span>
              </div>
            </div>

            <p className="mt-4 text-lg text-foreground font-semibold">
              Nuestras motos estarán disponibles en el año{" "}
              <span className="font-black text-primary">2400</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tu reserva VIP ha sido registrada en el libro mayor de Akira Motors.
            </p>

            <AkButton
              className="mx-auto mt-6 px-8"
              onClick={() => navigate("/")}
            >
              Volver al home
            </AkButton>
          </div>
        </div>
      )}
    </main>
  );
}
