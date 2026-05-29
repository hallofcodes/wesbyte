'use client';
import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { compileJSX } from '@/lib/compileJSX';

export function DirectRenderer() {
  const { files, compiledFiles, setCompiledFile } = useProjectStore();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) return;
    for (const [path, code] of Object.entries(files)) {
      try {
        const compiled = compileJSX(code);
        setCompiledFile(path, compiled);
      } catch (err: any) {
        setError(`Compile error in ${path}: ${err.message}`);
      }
    }
  }, [files, setCompiledFile]);

  useEffect(() => {
    const appCode = compiledFiles['src/App.jsx'];
    if (!appCode) return;

    try {
      const modules: Record<string, any> = {};

      const customRequire = (id: string): any => {
        if (modules[id]) return modules[id];
        const moduleCode = compiledFiles[id];
        if (!moduleCode) throw new Error(`Module not found: ${id}`);
        const moduleObj = { exports: {} };
        const fn = new Function('require', 'exports', 'module', 'React', moduleCode);
        fn(customRequire, moduleObj.exports, moduleObj, React);
        modules[id] = moduleObj.exports.default || moduleObj.exports;
        return modules[id];
      };

      const AppModule = customRequire('src/App.jsx');
      setComponent(() => AppModule);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  }, [compiledFiles]);

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!Component) return <div className="p-4">Loading component...</div>;
  return <Component />;
}