/**
 * DOM Node type (AI contract)
 */
export interface UINode {
  type: string; // html tag only
  props?: Record<string, any>;
  children?: Array<UINode | string>;
}

export interface AIResponse {
  tree: UINode;
}

/**
 * MOCK AI RESPONSE (DOM TREE ONLY)
 */

const MOCK_RESPONSE: AIResponse = {
  tree: {
    type: "div",
    props: {
      className: "min-h-screen flex flex-col bg-white text-gray-900"
    },
    children: [
      // NAVBAR
      {
        type: "nav",
        props: {
          className:
            "flex items-center justify-between px-10 py-6 border-b"
        },
        children: [
          {
            type: "div",
            props: { className: "text-xl font-bold" },
            children: ["Brand"]
          },
          {
            type: "div",
            props: { className: "flex gap-6 text-sm" },
            children: [
              { type: "a", props: { href: "#", className: "hover:underline" }, children: ["Home"] },
              { type: "a", props: { href: "#", className: "hover:underline" }, children: ["About"] }
            ]
          }
        ]
      },

      // HERO SECTION
      {
        type: "section",
        props: {
          className:
            "flex flex-col items-center justify-center text-center py-32 px-6 space-y-6"
        },
        children: [
          {
            type: "h1",
            props: {
              className: "text-5xl font-bold tracking-tight"
            },
            children: ["Build Something Amazing"]
          },
          {
            type: "p",
            props: {
              className: "text-lg text-gray-600 max-w-xl"
            },
            children: ["AI-generated website builder with modern UI structure"]
          },
          {
            type: "button",
            props: {
              className:
                "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            },
            children: ["Get Started"]
          }
        ]
      }
    ]
  }
};

/**
 * MAIN FUNCTION
 */
export async function generateComponents(prompt: string): Promise<UINode> {
  return MOCK_RESPONSE.tree;
}