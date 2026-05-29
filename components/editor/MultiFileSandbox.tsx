
'use client';
import { useRef, useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { compileJSX } from '@/lib/compileJSX';

export function MultiFileSandbox() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { files, compiledFiles, setCompiledFile } = useProjectStore();
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) return;
    setCompiling(true);
    for (const [path, code] of Object.entries(files)) {
      try {
        const compiled = compileJSX(code);
        setCompiledFile(path, compiled);
      } catch (err: any) {
        setCompiledFile(path, `throw new Error("Compilation failed: ${err.message}");`);
      }
    }
    setCompiling(false);
  }, [files, setCompiledFile]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (!compiledFiles || Object.keys(compiledFiles).length === 0) return;

    const entryKey = 'src/App.jsx';
    if (!compiledFiles[entryKey]) return;

    // Build a safe JSON string of all modules (escape for embedding)
    const modulesJson = JSON.stringify(compiledFiles);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>
  <script>
    // Make React and ReactDOM available globally
    window.React = React;
    window.ReactDOM = ReactDOM;
    // Also as local variables for eval
    var React = window.React;
    var ReactDOM = window.ReactDOM;
  </script>
  <script>
    var __modules = ${modulesJson};
    var __cache = {};

    function require(id) {
      if (__cache[id]) return __cache[id];
      var code = __modules[id];
      if (!code) throw new Error('Module not found: ' + id);
      var module = { exports: {} };
      var exports = module.exports;
      // Evaluate module code – it will have access to React, require, exports, module
      eval(code);
      __cache[id] = module.exports.default || module.exports;
      return __cache[id];
    }
    window.require = require;
  </script>
</head>
<body>
  <div id="root"></div>
  <script>
    try {
      var App = require('${entryKey}');
      var root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    } catch (err) {
      document.getElementById('root').innerHTML = '<pre style="color:red">' + err.message + '</pre>';
    }
  </script>
</body>
</html>`;
    iframe.srcdoc = html;
  }, [compiledFiles]);

  if (compiling) return <div className="flex items-center justify-center h-full">Compiling...</div>;
  return <iframe ref={iframeRef} title="Preview" className="w-full h-full border-0" />;
}