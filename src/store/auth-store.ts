import { create } from "zustand";

export interface SignupDraftData {
  first_name?: string;
  last_name?: string;
  national_id?: string;
  phone_number?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  county?: string;
  residence_address?: string;
}

interface AuthStoreState {
  step: number;
  signupData: Partial<SignupDraftData>;
  draftRevision: number;
  setStep: (step: number) => void;
  updateSignupData: (data: Partial<SignupDraftData>) => void;
  persistDraft: (data: Partial<SignupDraftData>, step: number) => void;
  clearDraft: () => void;
  reset: () => void;
}

const useAuthStore = create<AuthStoreState>((set) => ({
  step: 1,
  signupData: {},
  draftRevision: 0,
  setStep: (step) => set({ step }),
  updateSignupData: (data) =>
    set((state) => ({ signupData: { ...state.signupData, ...data } })),
  persistDraft: (data, step) =>
    set((state) => ({
      signupData: { ...state.signupData, ...data },
      step,
    })),
  clearDraft: () =>
    set((state) => ({
      signupData: {},
      step: 1,
      draftRevision: state.draftRevision + 1,
    })),
  reset: () =>
    set((state) => ({
      signupData: {},
      step: 1,
      draftRevision: state.draftRevision + 1,
    })),
}));

export default useAuthStore;
