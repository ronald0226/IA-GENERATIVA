import { useState, useEffect } from "react";
import { RouterProvider, useRouter } from "./components/akira/NavigationContext";
import { AuthProvider } from "./components/akira/AuthContext";
import { AuthModal } from "./components/akira/AuthModal";
import { WelcomeModal } from "./components/akira/WelcomeModal";
import { Nav } from "./components/akira/Nav";
import { HorizontalPage } from "./components/akira/Horizontal";
import { Footer } from "./components/akira/Sections";
import { BikeDetailPage } from "./components/akira/BikeDetailPage";
import { ComprarPage } from "./components/akira/ComprarPage";

function QuotaBanner() {
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  useEffect(() => {
    const handleQuota = () => setShowQuotaWarning(true);
    window.addEventListener("gmp-quota-exceeded", handleQuota);
    return () => window.removeEventListener("gmp-quota-exceeded", handleQuota);
  }, []);

  if (!showQuotaWarning) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm backdrop-blur-md">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{" "}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-300 hover:text-amber-100"
        >
          maps developer site
        </a>{" "}
        for instructions to update your account.
      </span>
    </div>
  );
}

function AppContent() {
  const { path } = useRouter();

  if (path.startsWith("/comprar/")) {
    const slug = path.replace("/comprar/", "").split("/")[0] || "akr-1390";
    return (
      <>
        <QuotaBanner />
        <ComprarPage slug={slug} />
      </>
    );
  }

  if (path.startsWith("/motos/")) {
    const slug = path.replace("/motos/", "").split("/")[0] || "akr-1390";
    return (
      <>
        <QuotaBanner />
        <BikeDetailPage slug={slug} />
      </>
    );
  }

  return (
    <main
      id="top"
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      <QuotaBanner />
      <Nav />
      <HorizontalPage />
      <Footer />
    </main>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
        <AuthModal />
        <WelcomeModal />
      </AuthProvider>
    </RouterProvider>
  );
}
