import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "FARMER" | "BUYER";

export interface UserSession {
  userId?: number | undefined;
  phoneNumber?: string | undefined;
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role?: UserRole | undefined;
}

interface AuthContextType {
  user: UserSession | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  login: (userData: UserSession) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem("fruitvyapar_user") || localStorage.getItem("kisanvyapar_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("fruitvyapar_user");
      localStorage.removeItem("kisanvyapar_user");
      localStorage.removeItem("fv_sell_form_draft");
      localStorage.removeItem("fv-listings");
    } catch {}
  };

  const login = (userData: UserSession) => {
    setUser(userData);
    try {
      localStorage.setItem("fruitvyapar_user", JSON.stringify(userData));
      localStorage.removeItem("fv-listings");
    } catch {}
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const validateSavedUser = async () => {
      const saved = localStorage.getItem("fruitvyapar_user") || localStorage.getItem("kisanvyapar_user");
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved);
        if (!parsed || (!parsed.userId && !parsed.email)) {
          logout();
          return;
        }

        const query = parsed.userId
          ? `userId=${parsed.userId}`
          : `email=${encodeURIComponent(parsed.email)}`;
        const res = await fetch(`http://localhost:8090/api/v1/auth/user-profile?${query}`);
        if (!res.ok) {
          // If database was cleaned or user record not found, reset to logged out state
          logout();
          return;
        }
        const data = await res.json();
        if (data.success && data.data) {
          const u = data.data;
          const freshUser: UserSession = {
            userId: u.userId,
            email: u.email,
            phoneNumber: u.phoneNumber,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role || "BUYER",
          };
          setUser(freshUser);
          localStorage.setItem("fruitvyapar_user", JSON.stringify(freshUser));
        } else {
          logout();
        }
      } catch {
        // Backend offline fallback - leave current state
      }
    };

    validateSavedUser();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthModalOpen,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
