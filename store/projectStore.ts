import { create } from 'zustand';

interface ProjectStore {
  files: Record<string, string>;
  compiledFiles: Record<string, string>;
  setFiles: (files: Record<string, string>) => void;
  setCompiledFile: (path: string, code: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  files: {},
  compiledFiles: {},
  setFiles: (files) => {
    console.log('[Store] setFiles called', Object.keys(files));
    set({ files, compiledFiles: {} });
  },
  setCompiledFile: (path, code) => {
    console.log('[Store] setCompiledFile', path);
    set((state) => ({
      compiledFiles: { ...state.compiledFiles, [path]: code },
    }));
  },
}));