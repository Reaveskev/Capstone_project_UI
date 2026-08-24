import { createContext, useContext, useState, type ReactNode } from "react";
import { loginRequest } from "../api/auth";

interface AuthUser {
  username: string;
  name: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const { token, role, firstName, lastName } = await loginRequest(
        username,
        password,
      );
      const authUser: AuthUser = {
        username,
        name: `${firstName} ${lastName}`.trim(),
        role,
        token,
      };
      setUser(authUser);
      localStorage.setItem("authUser", JSON.stringify(authUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
