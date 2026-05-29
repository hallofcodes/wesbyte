'use client';
import { useRef, useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { compileJSX } from '@/lib/compileJSX';

export function MultiFileSandbox() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { files, compiledFiles, setCompiledFile } = useProjectStore();
  const [compiling, setCompiling] = useState(false);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    console.log('[Sandbox] files changed:', files);
    if (!files || Object.keys(files).length === 0) {
      setDebug('No files');
      return;
    }
    setCompiling(true);
    setDebug('Compiling...');
    for (const [path, code] of Object.entries(files)) {
      console.log(`[Sandbox] Compiling ${path}...`);
      try {
        const compiled = compileJSX(code);
        console.log(`[Sandbox] Success: ${path} compiled, length ${compiled.length}`);
        setCompiledFile(path, compiled);
      } catch (err: any) {
        console.error(`[Sandbox] Error compiling ${path}:`, err);
        setCompiledFile(path, `throw new Error("Compilation failed: ${err.message}");`);
        setDebug(`Error: ${err.message}`);
      }
    }
    setCompiling(false);
    setDebug('Compilation done');
  }, [files, setCompiledFile]);

  useEffect(() => {
    console.log('[Sandbox] compiledFiles changed:', compiledFiles);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (!compiledFiles || Object.keys(compiledFiles).length === 0) {
      doc.open();
      doc.write('<html><body><pre>No compiled files yet</pre></body></html>');
      doc.close();
      setDebug('No compiled files yet');
      return;
    }

    const modulesScript = Object.entries(compiledFiles)
      .map(([path, code]) => `
        define('${path}', function(require, exports, module) {
          ${code}
        });
      `).join('\n');

    console.log('[Sandbox] modulesScript length:', modulesScript.length);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>
          <script>
            const modules = {};
            function define(id, factory) {
              modules[id] = { factory, loaded: false, exports: null };
            }
            function require(id) {
              const mod = modules[id];
              if (!mod) throw new Error('Module not found: ' + id);
              if (!mod.loaded) {
                const exports = {};
                mod.loaded = true;
                mod.factory(require, exports, { id });
                mod.exports = exports;
              }
              return mod.exports;
            }
            window.define = define;
            window.require = require;
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            try {
              ${modulesScript}
              const entry = require('src/App.jsx');
              const App = entry.default || entry;
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(App));
            } catch (err) {
              document.getElementById('root').innerHTML = '<pre style="color:red; white-space:pre-wrap;">' + err.message + '</pre>';
            }
          </script>
        </body>
      </html>
    `;
    doc.open();
    doc.write(html);
    doc.close();
    setDebug('Iframe updated');
  }, [compiledFiles]);

  return (
    <div className="w-full h-full relative">
      {compiling && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">Compiling...</div>}
      <iframe ref={iframeRef} title="Preview" sandbox="allow-same-origin allow-scripts" className="w-full h-full border-0" />
    </div>
  );
}