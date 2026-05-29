// lib/ai.ts
export async function generateProject(prompt: string): Promise<Record<string, string>> {
  console.log('[AI] generateProject called with prompt:', prompt);
  // Return multiple files
  return {
    'src/App.jsx': `import Header from 'src/Header.jsx';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ marginTop: '1rem' }}>
        <p>This is a multi‑file React component.</p>
        <button onClick={() => alert('Clicked!')}>Click me</button>
      </main>
    </div>
  );
}`,
    'src/Header.jsx': `export default function Header() {
  return <header style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>My Awesome Header</header>;
}`,
  };
}