"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const voidElements = new Set(["img", "input", "br", "hr", "meta", "link"]);

// Tags where it makes sense to edit direct text content
const textEditableTags = new Set([
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "button", "li", "td", "th", "label", "strong", "em",
  "b", "i", "pre", "code", "figcaption"
]);

export function PropertyPanel({
  selectedElement,
  classNameValue,
  onClassNameChange,
  idValue,
  onIdChange,
  textValue,
  onTextChange,
  srcValue,
  onSrcChange,
  hrefValue,
  onHrefChange,
  altValue,
  onAltChange,
  interactiveMode,
}: any) {
  if (!selectedElement) {
    return (
      <p className="text-muted-foreground text-sm">
        {interactiveMode
          ? "Shift+click any element to edit its properties."
          : "Click any element to edit its properties."}
      </p>
    );
  }

  const tagLower = selectedElement.toLowerCase();
  const isVoid = voidElements.has(tagLower);
  const showTextField = !isVoid && textEditableTags.has(tagLower);

  return (
    <div className="space-y-4">
      <div>
        <Label>Tag</Label>
        <div className="mt-1 p-2 border rounded-md bg-muted/30">{selectedElement}</div>
      </div>
      <div>
        <Label>Class Name</Label>
        <Input
          value={classNameValue}
          onChange={(e) => onClassNameChange(e.target.value)}
          placeholder="className"
        />
      </div>
      <div>
        <Label>ID</Label>
        <Input
          value={idValue}
          onChange={(e) => onIdChange(e.target.value)}
          placeholder="id"
        />
      </div>
      {showTextField && (
        <div>
          <Label>Text Content</Label>
          <Input
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="text"
          />
        </div>
      )}
      {tagLower === "img" && (
        <>
          <div>
            <Label>Source (src)</Label>
            <Input
              value={srcValue}
              onChange={(e) => onSrcChange(e.target.value)}
              placeholder="image url"
            />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={altValue}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="alt"
            />
          </div>
        </>
      )}
      {tagLower === "a" && (
        <div>
          <Label>Href</Label>
          <Input
            value={hrefValue}
            onChange={(e) => onHrefChange(e.target.value)}
            placeholder="https://"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Editing the first occurrence of &lt;{selectedElement}&gt;.
      </p>
    </div>
  );
}