import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, logoutUser } from "../api/auth.api";
import { AuthContext, type User } from "./AuthContextType";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, verify the httpOnly refresh-cookie is still valid by calling /me.
    // The axios instance (auth.api) attaches withCredentials so the cookie goes along.
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the request fails, clear local state
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}