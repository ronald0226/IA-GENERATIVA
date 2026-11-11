import { useState, type FormEvent, useEffect } from "react";
import {
  X,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Phone,
  FileText,
  MapPin,
  Mail,
  Lock,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { AkButton, Eyebrow, HudBracket } from "./ui";
import { cities } from "./data";
import { sound } from "./engineSound";
import {
  validateLoginForm,
  validateRegisterForm,
  validateRegisterStep1,
  validateRegisterStep2,
  validateRegisterStep3,
  type RegisterInput,
  type LoginInput,
} from "./logic";
import { cn } from "@/src/lib/utils";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginInput>({
    identifier: "",
    password: "",
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterInput>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    usuario: "",
    email: "",
    documento: "",
    telefono: "",
    ciudad: cities[0] || "Bogotá",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab);
      setRegisterStep(1);
      setGlobalError(null);
      setLoginErrors({});
      setRegisterErrors({});
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleTabChange = (nextTab: "login" | "register") => {
    sound.playMechanicalClick();
    setTab(nextTab);
    setRegisterStep(1);
    setGlobalError(null);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const validation = validateLoginForm(loginForm);
    if (Object.keys(validation).length > 0) {
      setLoginErrors(validation);
      return;
    }
    setLoginErrors({});

    const result = login(loginForm.identifier, loginForm.password);
    if (!result.success) {
      setGlobalError(result.error || "Credenciales incorrectas");
    }
  };

  // Step 1 -> Step 2
  const handleNextStep1 = () => {
    sound.playMechanicalClick();
    setGlobalError(null);
    const errors = validateRegisterStep1(registerForm);
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }
    setRegisterErrors({});
    setRegisterStep(2);
  };

  // Step 2 -> Step 3
  const handleNextStep2 = () => {
    sound.playMechanicalClick();
    setGlobalError(null);
    const errors = validateRegisterStep2(registerForm);
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }
    setRegisterErrors({});
    setRegisterStep(3);
  };

  // Back step
  const handlePrevStep = () => {
    sound.playMechanicalClick();
    setGlobalError(null);
    if (registerStep === 3) setRegisterStep(2);
    else if (registerStep === 2) setRegisterStep(1);
  };

  // Final register submission
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Validate current step (Step 3) and full form
    const step3Errors = validateRegisterStep3(registerForm);
    const allErrors = validateRegisterForm(registerForm);

    if (Object.keys(step3Errors).length > 0 || Object.keys(allErrors).length > 0) {
      setRegisterErrors({ ...allErrors, ...step3Errors });
      // If error is in earlier steps, route user back to that step
      if (
        allErrors.primerNombre ||
        allErrors.primerApellido ||
        allErrors.usuario
      ) {
        setRegisterStep(1);
      } else if (
        allErrors.documento ||
        allErrors.telefono ||
        allErrors.ciudad
      ) {
        setRegisterStep(2);
      }
      return;
    }
    setRegisterErrors({});

    const result = register(registerForm);
    if (!result.success) {
      setGlobalError(result.error || "Error al registrar la cuenta");
    }
  };

  const fillDemoCredentials = () => {
    sound.playMechanicalClick();
    setLoginForm({
      identifier: "piloto_akira",
      password: "akira2026",
    });
    setLoginErrors({});
    setGlobalError(null);
  };

  // Red color variants from brand specification: #E5173E and #D4232D (replacing dark pink)
  const labelRed1 =
    "block mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#E5173E] dark:text-[#E5173E]";
  const labelRed2 =
    "block mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#D4232D] dark:text-[#D4232D]";
  const labelRed = labelRed1;

  const inputClass =
    "w-full rounded-none border-2 border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors font-medium";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-none border-2 border-primary bg-card p-6 sm:p-8 shadow-2xl text-left no-scrollbar">
        <HudBracket />

        {/* Close Button - Sharp Hard Edge */}
        <button
          type="button"
          aria-label="Cerrar modal de autenticación"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-none border-2 border-border p-1.5 text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer bg-card"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Eyebrow & Title */}
        <Eyebrow kanji={tab === "login" ? "ログイン" : "新規登録"}>
          {tab === "login" ? "Acceso de Piloto" : "Registro de Piloto"}
        </Eyebrow>

        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-foreground leading-tight tracking-tight">
          {tab === "login" ? "Iniciar Sesión" : "Crear Cuenta de Piloto"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground font-medium">
          {tab === "login"
            ? "Ingresa a tu cuenta de Akira Motors para gestionar tus compras, test drives y telemetría."
            : "Registro oficial por etapas en el circuito de alta gama Akira Motors."}
        </p>

        {/* Tab Switcher - Sharp Hard Edges */}
        <div className="mt-5 flex border-b-2 border-border">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 border-b-2 -mb-[2px] rounded-none",
              tab === "login"
                ? "border-primary text-primary font-black bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn size={14} /> 01 · Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={cn(
              "flex-1 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 border-b-2 -mb-[2px] rounded-none",
              tab === "register"
                ? "border-primary text-primary font-black bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus size={14} /> 02 · Crear Cuenta
          </button>
        </div>

        {/* Global Error Banner - Hard Edges */}
        {globalError && (
          <div className="mt-4 rounded-none border-2 border-destructive bg-destructive/10 p-3 text-xs font-bold text-destructive">
            {globalError}
          </div>
        )}

        {/* ----------------- LOGIN FORM ----------------- */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} noValidate className="mt-6 space-y-4">
            <div>
              {/* Variant 1: #E5173E */}
              <label className={labelRed1}>
                Usuario o Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginForm.identifier}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, identifier: e.target.value })
                  }
                  placeholder="ej. piloto_akira o piloto@akiramotors.com"
                  className={inputClass}
                />
                <User
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
              {loginErrors.identifier && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {loginErrors.identifier}
                </span>
              )}
            </div>

            <div>
              {/* Variant 2: #D4232D */}
              <label className={labelRed2}>
                Contraseña *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Introduce tu contraseña"
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={showPass ? "Ocultar contraseña" : "Ver contraseña"}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginErrors.password && (
                <span className="mt-1 block text-xs text-destructive font-medium">
                  {loginErrors.password}
                </span>
              )}
            </div>

            {/* Quick Demo Access Helper */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs font-mono font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <KeyRound size={12} /> Cargar credenciales demo (piloto_akira)
              </button>
            </div>

            <AkButton type="submit" className="w-full py-3 mt-2">
              Iniciar Sesión
            </AkButton>

            <div className="border-t border-border/60 pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                ¿Aún no tienes cuenta oficial?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className="text-primary font-bold hover:underline cursor-pointer ml-1"
                >
                  Crear mi cuenta ahora
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ----------------- MULTI-STEP REGISTER FORM ----------------- */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} noValidate className="mt-5">
            {/* Stage Progress HUD Bar - Hard Edges */}
            <div className="mb-5 border-2 border-border/80 bg-background/70 p-3 rounded-none">
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="font-bold text-foreground">
                  ETAPA 0{registerStep} / 03:{" "}
                  <span className="text-[#E5173E] dark:text-[#E5173E] font-black">
                    {registerStep === 1
                      ? "NOMBRES & USUARIO"
                      : registerStep === 2
                      ? "TELÉFONO, CÉDULA & CIUDAD"
                      : "CORREO & CONTRASEÑA"}
                  </span>
                </span>
                <span className="text-muted-foreground font-semibold">
                  {registerStep === 1 ? "Paso 1 de 3" : registerStep === 2 ? "Paso 2 de 3" : "Paso 3 de 3"}
                </span>
              </div>

              {/* 3 Step bars */}
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                <div
                  className={cn(
                    "h-full rounded-none transition-all",
                    registerStep >= 1 ? "bg-primary" : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "h-full rounded-none transition-all",
                    registerStep >= 2 ? "bg-primary" : "bg-muted"
                  )}
                />
                <div
                  className={cn(
                    "h-full rounded-none transition-all",
                    registerStep >= 3 ? "bg-primary" : "bg-muted"
                  )}
                />
              </div>
            </div>

            {/* ========== ETAPA 1: NOMBRES Y USUARIO ========== */}
            {registerStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                {/* Primer Nombre (#E5173E) y Segundo Nombre (#D4232D) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelRed1}>
                      Primer Nombre *
                    </label>
                    <input
                      name="primerNombre"
                      type="text"
                      required
                      maxLength={40}
                      value={registerForm.primerNombre}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, primerNombre: e.target.value })
                      }
                      placeholder="ej. Carlos"
                      className={inputClass}
                    />
                    {registerErrors.primerNombre && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.primerNombre}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={labelRed2}>
                      Segundo Nombre <span className="opacity-70 font-normal">(Opcional)</span>
                    </label>
                    <input
                      name="segundoNombre"
                      type="text"
                      maxLength={40}
                      value={registerForm.segundoNombre}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, segundoNombre: e.target.value })
                      }
                      placeholder="ej. Eduardo"
                      className={inputClass}
                    />
                    {registerErrors.segundoNombre && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.segundoNombre}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primer Apellido (#E5173E) y Segundo Apellido (#D4232D) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelRed1}>
                      Primer Apellido *
                    </label>
                    <input
                      name="primerApellido"
                      type="text"
                      required
                      maxLength={40}
                      value={registerForm.primerApellido}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, primerApellido: e.target.value })
                      }
                      placeholder="ej. Gómez"
                      className={inputClass}
                    />
                    {registerErrors.primerApellido && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.primerApellido}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={labelRed2}>
                      Segundo Apellido <span className="opacity-70 font-normal">(Opcional)</span>
                    </label>
                    <input
                      name="segundoApellido"
                      type="text"
                      maxLength={40}
                      value={registerForm.segundoApellido}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, segundoApellido: e.target.value })
                      }
                      placeholder="ej. Restrepo"
                      className={inputClass}
                    />
                    {registerErrors.segundoApellido && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.segundoApellido}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre de Usuario (#E5173E) */}
                <div>
                  <label className={labelRed1}>
                    Nombre de Usuario * <span className="text-[10px] text-muted-foreground font-normal">(Alfanumérico)</span>
                  </label>
                  <div className="relative">
                    <input
                      name="usuario"
                      type="text"
                      required
                      maxLength={20}
                      value={registerForm.usuario}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, usuario: e.target.value })
                      }
                      placeholder="ej. piloto_carlos"
                      className={inputClass}
                    />
                    <User
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {registerErrors.usuario && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.usuario}
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <AkButton
                    type="button"
                    onClick={handleNextStep1}
                    className="w-full py-3 flex items-center justify-center gap-2"
                  >
                    <span>Siguiente: Contacto & Cédula</span>
                    <ArrowRight size={15} />
                  </AkButton>
                </div>
              </div>
            )}

            {/* ========== ETAPA 2: TELÉFONO, CÉDULA Y CIUDAD ========== */}
            {registerStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                {/* Cédula / Documento (#D4232D) */}
                <div>
                  <label className={labelRed2}>
                    Cédula / Documento de Identidad * <span className="text-[10px] lowercase font-normal opacity-70">(solo números)</span>
                  </label>
                  <div className="relative">
                    <input
                      name="documento"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={12}
                      value={registerForm.documento}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                        setRegisterForm({ ...registerForm, documento: onlyNums });
                      }}
                      placeholder="ej. 1020304050"
                      className={inputClass}
                    />
                    <FileText
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {registerErrors.documento && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.documento}
                    </span>
                  )}
                </div>

                {/* Teléfono Móvil (#E5173E) */}
                <div>
                  <label className={labelRed1}>
                    Teléfono Móvil *
                  </label>
                  <div className="relative">
                    <input
                      name="telefono"
                      type="tel"
                      required
                      maxLength={15}
                      value={registerForm.telefono}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, telefono: e.target.value })
                      }
                      placeholder="ej. +57 300 1234567"
                      className={inputClass}
                    />
                    <Phone
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {registerErrors.telefono && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.telefono}
                    </span>
                  )}
                </div>

                {/* Ciudad de Residencia (#D4232D) */}
                <div>
                  <label className={labelRed2}>
                    Ciudad de Residencia *
                  </label>
                  <div className="relative">
                    <select
                      name="ciudad"
                      value={registerForm.ciudad}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, ciudad: e.target.value })
                      }
                      className={inputClass}
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <MapPin
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {registerErrors.ciudad && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.ciudad}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <AkButton
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={15} />
                    <span>Atrás</span>
                  </AkButton>

                  <AkButton
                    type="button"
                    onClick={handleNextStep2}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5"
                  >
                    <span>Siguiente</span>
                    <ArrowRight size={15} />
                  </AkButton>
                </div>
              </div>
            )}

            {/* ========== ETAPA 3: CORREO Y CONTRASEÑA ========== */}
            {registerStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                {/* Correo Electrónico (#E5173E) */}
                <div>
                  <label className={labelRed1}>
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={100}
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                      placeholder="ej. piloto@akiramotors.com"
                      className={inputClass}
                    />
                    <Mail
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {registerErrors.email && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.email}
                    </span>
                  )}
                </div>

                {/* Crear Contraseña (#D4232D) y Confirmar (#E5173E) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelRed2}>
                      Crear Contraseña * <span className="text-[10px] font-normal opacity-80">(mín. 6)</span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPass ? "text" : "password"}
                        required
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                        placeholder="Mínimo 6 caracteres"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.password}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={labelRed1}>
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Repite la contraseña"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <span className="mt-1 block text-xs text-destructive font-medium">
                        {registerErrors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="terminos"
                      checked={registerForm.terminos}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, terminos: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded-none border-2 border-border accent-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground font-medium">
                      Acepto los términos y política de tratamiento de datos de{" "}
                      <strong className="text-foreground">Akira Motors</strong>.
                    </span>
                  </label>
                  {registerErrors.terminos && (
                    <span className="mt-1 block text-xs text-destructive font-medium">
                      {registerErrors.terminos}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <AkButton
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={15} />
                    <span>Atrás</span>
                  </AkButton>

                  <AkButton
                    type="submit"
                    className="flex-[1.4] py-3 flex items-center justify-center gap-1.5"
                  >
                    <span>Finalizar Registro</span>
                    <CheckCircle2 size={16} />
                  </AkButton>
                </div>
              </div>
            )}

            <div className="border-t border-border/60 pt-4 mt-5 text-center">
              <p className="text-xs text-muted-foreground">
                ¿Ya tienes una cuenta registrada?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-primary font-bold hover:underline cursor-pointer ml-1"
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
