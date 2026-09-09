import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
  type User,
} from "../services/authService";

const TOKEN_KEY = "dynamic_pricing_access_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        setUser(currentUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, [token]);

  const login = async (
    email: string,
    password: string,
  ): Promise<User> => {
    const tokenResponse = await loginUser(email, password);

    localStorage.setItem(
      TOKEN_KEY,
      tokenResponse.access_token,
    );

    setToken(tokenResponse.access_token);

    const currentUser = await getCurrentUser(
      tokenResponse.access_token,
    );

    setUser(currentUser);

    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider.",
    );
  }

  return context;
}