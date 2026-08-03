import { create } from 'zustand';

interface ProjectStore {
  files: Record<string, string>;
  compiledFiles: Record<string, string>;
  selectedFilePath: string | null;
  setFiles: (files: Record<string, string>) => void;
  setCompiledFile: (path: string, code: string) => void;
  setSelectedFilePath: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  files: {},
  compiledFiles: {},
  selectedFilePath: null,
  setFiles: (files) => set({ files, compiledFiles: {}, selectedFilePath: null }),
  setCompiledFile: (path, code) =>
    set((state) => ({
      compiledFiles: { ...state.compiledFiles, [path]: code },
    })),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  updateFileContent: (path, content) =>
    set((state) => ({
      files: { ...state.files, [path]: content },
      compiledFiles: {}, // reset compiled cache so it recompiles
    })),
}));