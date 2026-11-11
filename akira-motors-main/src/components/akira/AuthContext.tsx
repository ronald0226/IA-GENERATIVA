import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserProfile, RegisterInput, LoginInput } from "./logic";
import { sound } from "./engineSound";

interface StoredUser extends UserProfile {
  password: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr_akira_001",
    riderCode: "AKR-1390",
    primerNombre: "Tetsuo",
    segundoNombre: "Kenji",
    primerApellido: "Shima",
    segundoApellido: "",
    nombreCompleto: "Tetsuo Kenji Shima",
    usuario: "piloto_akira",
    email: "piloto@akiramotors.com",
    documento: "1029384756",
    telefono: "+57 315 7894512",
    ciudad: "Bogotá",
    password: "akira2026",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  welcomeModalUser: UserProfile | null;
  openAuthModal: (tab?: "login" | "register", onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  closeWelcomeModal: () => void;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  register: (input: RegisterInput) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalTab: "login",
  welcomeModalUser: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  closeWelcomeModal: () => {},
  login: () => ({ success: false }),
  register: () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const USERS_STORAGE_KEY = "akira_registered_riders_v1";
const SESSION_STORAGE_KEY = "akira_current_rider_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
          return JSON.parse(savedSession);
        }
      } catch (err) {
        console.warn("Error restoring session:", err);
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [welcomeModalUser, setWelcomeModalUser] = useState<UserProfile | null>(null);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);

  // Initialize preloaded riders if empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (!stored) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        }
      } catch (err) {
        console.warn("Storage init warning:", err);
      }
    }
  }, []);

  const getStoredUsers = (): StoredUser[] => {
    if (typeof window === "undefined") return DEFAULT_USERS;
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS;
  };

  const saveStoredUsers = (users: StoredUser[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (err) {
        console.warn("Error saving users:", err);
      }
    }
  };

  const openAuthModal = (tab: "login" | "register" = "login", onSuccess?: () => void) => {
    sound.playMechanicalClick();
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
    if (onSuccess) {
      setPendingSuccessCallback(() => onSuccess);
    } else {
      setPendingSuccessCallback(null);
    }
  };

  const closeAuthModal = () => {
    sound.playMechanicalClick();
    setIsAuthModalOpen(false);
    setPendingSuccessCallback(null);
  };

  const closeWelcomeModal = () => {
    sound.playMechanicalClick();
    setWelcomeModalUser(null);
  };

  const login = (identifier: string, password: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        (u.usuario.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
        u.password === cleanPass
    );

    if (!found) {
      return {
        success: false,
        error: "Credenciales incorrectas. Verifica tu usuario/correo y contraseña.",
      };
    }

    const { password: _, ...profile } = found;
    setUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    }

    setIsAuthModalOpen(false);
    sound.playMechanicalClick();

    if (pendingSuccessCallback) {
      pendingSuccessCallback();
      setPendingSuccessCallback(null);
    }

    return { success: true };
  };

  const register = (input: RegisterInput): { success: boolean; error?: string } => {
    const users = getStoredUsers();

    // Check if user or email already exists
    const cleanUsername = input.usuario.trim().toLowerCase();
    const cleanEmail = input.email.trim().toLowerCase();

    if (users.some((u) => u.usuario.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: "El nombre de usuario ya está registrado por otro piloto. Elige otro.",
      };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: "Ya existe una cuenta con este correo electrónico. Inicia sesión.",
      };
    }

    // Build full name
    const parts = [
      input.primerNombre.trim(),
      input.segundoNombre?.trim() || "",
      input.primerApellido.trim(),
      input.segundoApellido?.trim() || "",
    ].filter(Boolean);
    const nombreCompleto = parts.join(" ");

    const riderNum = Math.floor(1000 + Math.random() * 9000);
    const riderCode = `AKR-${riderNum}`;

    const newRider: StoredUser = {
      id: `usr_${Date.now()}`,
      riderCode,
      primerNombre: input.primerNombre.trim(),
      segundoNombre: input.segundoNombre?.trim() || "",
      primerApellido: input.primerApellido.trim(),
      segundoApellido: input.segundoApellido?.trim() || "",
      nombreCompleto,
      usuario: input.usuario.trim(),
      email: input.email.trim(),
      documento: input.documento.trim(),
      telefono: input.telefono.trim(),
      ciudad: input.ciudad,
      password: input.password,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newRider];
    saveStoredUsers(updatedUsers);

    // Auto login
    const { password: _, ...profile } = newRider;
    setUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    }

    setIsAuthModalOpen(false);
    sound.playMechanicalClick();

    // Show welcome modal
    setWelcomeModalUser(profile);

    if (pendingSuccessCallback) {
      pendingSuccessCallback();
      setPendingSuccessCallback(null);
    }

    return { success: true };
  };

  const logout = () => {
    sound.playMechanicalClick();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        welcomeModalUser,
        openAuthModal,
        closeAuthModal,
        closeWelcomeModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
