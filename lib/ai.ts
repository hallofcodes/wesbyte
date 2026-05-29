import {
  createComponent,
  type WebsiteComponent,
  type ComponentContent,
  type ComponentType,
} from "@/types";

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
      className: "min-h-screen flex flex-col bg-white text-gray-900",
    },
    children: [
      // NAVBAR
      {
        type: "nav",
        props: {
          className: "flex items-center justify-between px-10 py-6 border-b",
        },
        children: [
          {
            type: "div",
            props: { className: "text-xl font-bold" },
            children: ["Brand"],
          },
          {
            type: "div",
            props: { className: "flex gap-6 text-sm" },
            children: [
              {
                type: "a",
                props: { href: "#", className: "hover:underline" },
                children: ["Home"],
              },
              {
                type: "a",
                props: { href: "#", className: "hover:underline" },
                children: ["About"],
              },
            ],
          },
        ],
      },

      // HERO SECTION
      {
        type: "section",
        props: {
          className:
            "flex flex-col items-center justify-center text-center py-32 px-6 space-y-6",
        },
        children: [
          {
            type: "h1",
            props: {
              className: "text-5xl font-bold tracking-tight",
            },
            children: ["Build Something Amazing"],
          },
          {
            type: "p",
            props: {
              className: "text-lg text-gray-600 max-w-xl",
            },
            children: ["AI-generated website builder with modern UI structure"],
          },
          {
            type: "button",
            props: {
              className:
                "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition",
            },
            children: ["Get Started"],
          },
        ],
      },
    ],
  },
};

/**
 * MAIN FUNCTION
 */
const extractText = (node: UINode) =>
  (node.children || [])
    .filter((c) => typeof c === "string")
    .join(" ")
    .trim();

const toComponent = (
  node: UINode,
  parentId: string | null = null,
  order = 0,
): WebsiteComponent => {
  const tag = node.type.toLowerCase();
  const text = extractText(node);

  let type: ComponentType = "container";
  let content: Partial<ComponentContent> = {};

  if (/^h[1-6]$/.test(tag)) {
    type = "heading";
    content = { text, tag: tag as ComponentContent["tag"] };
  } else if (tag === "p" || tag === "span") {
    type = "text";
    content = { text, tag: tag as ComponentContent["tag"] };
  } else if (tag === "a") {
    type = "text";
    content = { text, href: node.props?.href, tag: "a", props: node.props };
  } else if (tag === "button") {
    type = "button";
    content = { buttonText: text || "Button", tag: "button" };
  } else if (tag === "img") {
    type = "image";
    content = {
      image: node.props?.src,
      alt: node.props?.alt,
      tag: "img",
      props: node.props,
    };
  } else {
    type = "container";
    content = { tag: tag as ComponentContent["tag"], props: node.props };
  }

  const component = createComponent(type, content);
  component.parentId = parentId;
  component.order = order;
  if (node.props?.className) {
    component.styles = { ...component.styles, className: node.props.className };
  }

  const children = node.children || [];
  component.children = children
    .map((child, index) => {
      if (typeof child === "string") {
        const value = child.trim();
        if (!value) return null;
        const textComp = createComponent("text", { text: value });
        textComp.parentId = component.id;
        textComp.order = index;
        return textComp;
      }
      return toComponent(child, component.id, index);
    })
    .filter(Boolean) as WebsiteComponent[];

  return component;
};

export async function generateComponents(
  prompt: string,
): Promise<WebsiteComponent> {
  return toComponent(MOCK_RESPONSE.tree);
}
