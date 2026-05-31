"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { useProjectStore } from "@/store/projectStore";
import { compileJSX } from "@/lib/compileJSX";

function buildRequire(
  files: Record<string, string>,
  compiledCache: Record<string, string>,
  react: typeof React
) {
  const modules: Record<string, any> = {};

  const requireFn = (modulePath: string) => {
    // Special case for 'react'
    if (modulePath === "react" || modulePath === "React") {
      return react;
    }

    let fullPath = modulePath;
    if (!fullPath.startsWith("src/")) fullPath = "src/" + fullPath;
    if (!fullPath.endsWith(".jsx")) fullPath += ".jsx";

    if (modules[fullPath]) return modules[fullPath];
    if (!files[fullPath]) throw new Error(`Module not found: ${fullPath}`);

    const source = files[fullPath];
    const compiled = compiledCache[fullPath] || compileJSX(source);
    compiledCache[fullPath] = compiled;

    const moduleExports = {};
    const moduleObj = { exports: moduleExports };
    // Make React available as a global variable inside the evaluated code
    const evalCode = `(function(module, exports, require, React) { ${compiled} })`;
    const func = eval(evalCode);
    func(moduleObj, moduleObj.exports, requireFn, react);
    modules[fullPath] = moduleObj.exports;
    return modules[fullPath];
  };
  return requireFn;
}

interface Props {
  filePath: string | null;
  onError?: (error: string | null) => void;
}

export function ComponentPreviewRenderer({ filePath, onError }: Props) {
  const { files } = useProjectStore();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const compiledCacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!filePath || !files[filePath]) {
      setComponent(null);
      onError?.(null);
      return;
    }

    try {
      const requireFn = buildRequire(files, compiledCacheRef.current, React);
      const exports = requireFn(filePath);
      const Comp = exports.default || exports;
      if (typeof Comp === "function") {
        setComponent(() => Comp);
        onError?.(null);
      } else {
        const errorMsg = `File does not export a component: ${filePath}`;
        setComponent(null);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load component";
      setComponent(null);
      onError?.(errorMsg);
    }
  }, [filePath, files, onError]);

  if (!filePath) {
    return <div className="p-4 text-muted-foreground">Select a file to preview</div>;
  }
  if (!Component) {
    return (
      <div className="p-4 text-red-500">
        <p className="text-sm font-medium">Error previewing component</p>
        <p className="text-xs mt-1">Check the file for syntax errors or missing exports.</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <Component />
    </div>
  );
}