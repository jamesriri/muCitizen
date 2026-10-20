import { create } from "zustand";

interface UIStoreState {
  isPasswordVisible: boolean;
  togglePassword: () => void;
}

const useUIStore = create<UIStoreState>((set) => ({
  isPasswordVisible: false,
  togglePassword: () => set((state) => ({ isPasswordVisible: !state.isPasswordVisible })),
}));

export default useUIStore;
