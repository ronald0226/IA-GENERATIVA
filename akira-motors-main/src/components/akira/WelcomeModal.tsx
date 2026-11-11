import { CheckCircle2, ShieldCheck, X, Sparkles, User, Bike } from "lucide-react";
import { useAuth } from "./AuthContext";
import { AkButton, Eyebrow, HudBracket } from "./ui";
import { logoImg } from "./data";
import { useRouter } from "./NavigationContext";

export function WelcomeModal() {
  const { welcomeModalUser, closeWelcomeModal } = useAuth();
  const { navigate } = useRouter();

  if (!welcomeModalUser) return null;

  const handleContinueCatalog = () => {
    closeWelcomeModal();
    navigate("/", "catalogo");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-xl rounded-none border-2 border-primary bg-card p-6 sm:p-10 shadow-2xl text-center animate-in zoom-in-95">
        <HudBracket />

        <button
          type="button"
          aria-label="Cerrar mensaje de bienvenida"
          onClick={closeWelcomeModal}
          className="absolute right-4 top-4 rounded-none border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex justify-center mb-3">
          <img
            src={logoImg}
            alt="Akira Motors"
            className="akira-brand-logo h-9 w-auto object-contain"
          />
        </div>

        <Eyebrow kanji="歓迎">Registro Oficial Exitoso</Eyebrow>

        <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center border-2 border-primary bg-primary/10 text-primary">
          <CheckCircle2 size={36} className="text-primary animate-pulse" />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-foreground leading-tight">
          ¡Bienvenido a Akira Motors!
        </h2>
        
        <p className="mt-2 text-base font-bold text-primary">
          {welcomeModalUser.nombreCompleto}
        </p>

        <p className="mt-1 text-xs text-muted-foreground font-medium max-w-md mx-auto">
          Tu cuenta de piloto oficial ha sido generada y autenticada en el circuito Akira Motors.
        </p>

        {/* Cyberpunk Rider Credential Card */}
        <div className="mt-6 rounded-none border-2 border-border bg-background/80 p-4 text-left font-mono relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase text-primary-foreground tracking-widest">
            {welcomeModalUser.riderCode}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-sans">
                Piloto
              </span>
              <span className="font-bold text-foreground">
                @{welcomeModalUser.usuario}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-sans">
                Documento
              </span>
              <span className="font-bold text-foreground">
                {welcomeModalUser.documento}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-sans">
                Correo
              </span>
              <span className="font-bold text-foreground truncate block">
                {welcomeModalUser.email}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-sans">
                Ciudad / Base
              </span>
              <span className="font-bold text-foreground">
                {welcomeModalUser.ciudad}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck size={14} /> Acceso VIP Habilitado
            </span>
            <span className="text-muted-foreground text-[10px]">
              CIRCUITO NEO-TOKYO
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <AkButton
            variant="outline"
            onClick={closeWelcomeModal}
            className="w-full sm:w-auto"
          >
            Continuar
          </AkButton>
          <AkButton
            onClick={handleContinueCatalog}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Bike size={16} /> Ver Catálogo Oficial
          </AkButton>
        </div>
      </div>
    </div>
  );
}
