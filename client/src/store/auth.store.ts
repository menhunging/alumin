import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthUser = {
  id: number;
  login: string;
  clubsIDs: number[];
  managerClubIDs: number[];
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-session-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
