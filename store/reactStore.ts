import { create } from "zustand";

interface ReactStore {
  compiledJS: string;
  setCompiledJS: (code: string) => void;
  clearCompiledJS: () => void;
}

export const useReactStore = create<ReactStore>((set) => ({
  compiledJS: "",
  setCompiledJS: (code) => set({ compiledJS: code }),
  clearCompiledJS: () => set({ compiledJS: "" }),
}));
