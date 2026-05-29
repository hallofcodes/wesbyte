'use client';
import { useRef, useEffect } from 'react';
import { useReactStore } from '@/store/reactStore';

export function ReactSandbox() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { compiledJS } = useReactStore();

  useEffect(() => {
    if (!compiledJS) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script>
            try {
              ${compiledJS}
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(App));
            } catch (err) {
              document.getElementById('root').innerHTML = '<pre style="color:red">' + err.message + '</pre>';
            }
          </script>
        </body>
      </html>
    `;
    doc.open();
    doc.write(html);
    doc.close();
  }, [compiledJS]);

  return <iframe ref={iframeRef} title="Preview" sandbox="allow-same-origin allow-scripts" className="w-full h-full border-0" />;
}