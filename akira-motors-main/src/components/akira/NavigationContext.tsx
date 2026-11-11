import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from "react";
import { sound } from "./engineSound";

interface RouterContextType {
  path: string;
  navigate: (to: string, hash?: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: "/",
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname || "/";
    }
    return "/";
  });

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string, hash?: string) => {
    sound.stopAllAudio();
    const targetUrl = hash ? `${to}#${hash}` : to;
    if (window.location.pathname !== to || (hash && window.location.hash !== `#${hash}`)) {
      window.history.pushState({}, "", targetUrl);
    }
    setPath(to);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function CustomLink({
  to,
  hash,
  children,
  className,
  onClick,
}: {
  to: string;
  hash?: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { navigate } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to, hash);
  };

  const href = hash ? `${to}#${hash}` : to;

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
