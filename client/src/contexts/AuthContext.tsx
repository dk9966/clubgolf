import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  clubs: string[];
  managedClubs: string[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => void;
  facebookLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await auth.getCurrentUser();
        setUser(response.data);
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error.response?.data?.message || "Error loading user data");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await auth.login({ email, password });
      setUser(response.data.user);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await auth.register({ email, password, name });
      setUser(response.data.user);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error.response?.data?.message || "An error occurred during registration"
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error.response?.data?.message || "An error occurred during logout"
      );
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin: auth.googleLogin,
    facebookLogin: auth.facebookLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
