import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You generate small React projects for a live in-browser editor.

Output ONLY a JSON object (no markdown fences, no commentary) mapping file paths to source code strings. Requirements:
- Must include a "src/App.jsx" file whose component is the entry point.
- Components use CommonJS, not ES modules: require('src/Other.jsx') to import, module.exports = ComponentName to export. Do NOT use import/export syntax.
- Use inline style objects or className with Tailwind-style utility classes.
- Keep it to 2-4 files total.
- Every string value in the JSON must be valid, complete JSX/JS source for that file.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: "no_api_key" });
  }

  let prompt: string;
  try {
    const body = await req.json();
    prompt = String(body?.prompt || "").slice(0, 2000);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  if (!prompt.trim()) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json({ ok: false, reason: "api_error" });
    }

    const data = await response.json();
    const textBlock = data.content?.find((block: any) => block.type === "text");
    if (!textBlock?.text) {
      return NextResponse.json({ ok: false, reason: "api_error" });
    }

    const cleaned = textBlock.text.replace(/^```json\s*|\s*```$/g, "").trim();
    let files: Record<string, string>;
    try {
      files = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ ok: false, reason: "api_error" });
    }

    if (!files || typeof files !== "object" || !files["src/App.jsx"]) {
      return NextResponse.json({ ok: false, reason: "api_error" });
    }

    return NextResponse.json({ ok: true, files });
  } catch (err) {
    console.error("Generate route failed:", err);
    return NextResponse.json({ ok: false, reason: "api_error" });
  }
}
