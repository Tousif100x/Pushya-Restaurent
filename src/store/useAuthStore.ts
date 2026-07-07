import { create } from "zustand";

interface User {
  id: string;
  phone: string;
  name?: string | null;
  defaultAddress?: string | null;
  landmark?: string | null;
  instructions?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return;
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/me", { method: "DELETE" });
      set({ user: null, isAuthenticated: false });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  }
}));
