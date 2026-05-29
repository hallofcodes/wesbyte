export async function generateProject(prompt: string): Promise<Record<string, string>> {
  return {
    "src/App.jsx": `const Header = require('src/Header.jsx');
function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ marginTop: '1rem' }}>
        <p>This is a multi‑file React componento.</p>
        <button onClick={() => alert('Clicked!')} className="text-black px-4 py-2 rounded">
  Click me
</button>
        
      </main>
    </div>
  );
}
module.exports = App;`,
    "src/Header.jsx": `function Header() {
  return <header style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>My Awesome Header</header>;
}
module.exports = Header;`,
  };
}