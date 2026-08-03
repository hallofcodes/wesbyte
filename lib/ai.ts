export interface GenerateResult {
  files: Record<string, string>;
  usedFallback: boolean;
  fallbackReason?: string;
}

/**
 * Generates a project from a prompt.
 *
 * Tries the real AI backend first (POST /api/generate, which only works if
 * ANTHROPIC_API_KEY is set on the server). If that's unavailable for any
 * reason, falls back to a local template chosen by keywords in the prompt,
 * so the result at least reflects what the user asked for instead of
 * returning the exact same fixed page every time.
 */
export async function generateProject(prompt: string): Promise<GenerateResult> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.files) {
        return { files: data.files, usedFallback: false };
      }
      return {
        files: generateFallbackProject(prompt),
        usedFallback: true,
        fallbackReason: data.reason === "no_api_key" ? "no_api_key" : "api_error",
      };
    }

    return { files: generateFallbackProject(prompt), usedFallback: true, fallbackReason: "api_error" };
  } catch {
    // Network error, route not deployed, etc. — fall back locally rather than failing the whole flow.
    return { files: generateFallbackProject(prompt), usedFallback: true, fallbackReason: "api_error" };
  }
}

interface Template {
  match: RegExp;
  accent: string;
  accentDark: string;
  heading: string;
  tagline: string;
}

const TEMPLATES: Template[] = [
  {
    match: /tech|startup|saas|software|app\b/i,
    accent: "#3b82f6",
    accentDark: "#1d4ed8",
    heading: "Build faster with {brand}",
    tagline: "The modern platform for teams who ship.",
  },
  {
    match: /portfolio|designer|photographer|resume|cv\b/i,
    accent: "#111827",
    accentDark: "#000000",
    heading: "{brand}",
    tagline: "Selected work and case studies.",
  },
  {
    match: /e-?commerce|shop|store|product|pricing/i,
    accent: "#16a34a",
    accentDark: "#15803d",
    heading: "{brand}",
    tagline: "Quality products, straightforward pricing.",
  },
  {
    match: /restaurant|menu|cafe|food|reservation/i,
    accent: "#b91c1c",
    accentDark: "#7f1d1d",
    heading: "{brand}",
    tagline: "Fresh, seasonal, made to order.",
  },
  {
    match: /fitness|gym|workout|studio|class(es)?/i,
    accent: "#ea580c",
    accentDark: "#9a3412",
    heading: "{brand}",
    tagline: "Classes and coaching to help you show up.",
  },
];

const DEFAULT_TEMPLATE: Template = {
  match: /.*/,
  accent: "#6366f1",
  accentDark: "#4338ca",
  heading: "{brand}",
  tagline: "A starting point — customize everything from here.",
};

function pickTemplate(prompt: string): Template {
  return TEMPLATES.find((t) => t.match.test(prompt)) || DEFAULT_TEMPLATE;
}

function guessBrandName(prompt: string): string {
  // Pull a plausible short name out of the prompt, otherwise use a generic one.
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(the|for|and|with|website|page|landing|create|build|design|make)$/i.test(w));
  const brand = words.slice(0, 2).join(" ");
  return brand ? brand.replace(/\b\w/g, (c) => c.toUpperCase()) : "Your Brand";
}

/** Builds a project whose content actually reflects the prompt, rather than a single fixed page regardless of input. */
export function generateFallbackProject(prompt: string): Record<string, string> {
  const template = pickTemplate(prompt);
  const brand = guessBrandName(prompt);
  const heading = template.heading.replace("{brand}", brand);
  const safePrompt = prompt.replace(/`/g, "'").slice(0, 200);

  return {
    "src/App.jsx": `const Header = require('src/Header.jsx');
function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#1f2937' }}>
      <Header />
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>${heading}</h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '2rem' }}>${template.tagline}</p>
        <div style={{ padding: '1rem', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Starter template — no AI API key is configured, so this was generated from a local template based on your prompt: "${safePrompt}"</p>
        </div>
        <button
          style={{ background: '${template.accent}', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => alert('Get started!')}
        >
          Get Started
        </button>
      </main>
    </div>
  );
}
module.exports = App;`,
    "src/Header.jsx": `function Header() {
  return (
    <header style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '${template.accentDark}' }}>${brand}</span>
      <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
        <span>Home</span>
        <span>About</span>
        <span>Contact</span>
      </nav>
    </header>
  );
}
module.exports = Header;`,
  };
}
