import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IUserLogin } from "../../types/src";

type AuthState = {
  token: string | null;
  user: IUserLogin | null;
  setLogin: (token: string, user: IUserLogin) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setLogin: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "eatzy-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);