"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const voidElements = new Set(["img", "input", "br", "hr", "meta", "link"]);

const textEditableTags = new Set([
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "button", "li", "td", "th", "label", "strong", "em",
  "b", "i", "pre", "code", "figcaption"
]);

export function MobilePropertySheet({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  const tagLower = selectedElement?.toLowerCase() || "";
  const isVoid = voidElements.has(tagLower);
  const showTextField = !isVoid && textEditableTags.has(tagLower);

  return (
    <div className="fixed md:hidden left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out translate-y-0">
      <div
        className="bg-background border-t rounded-t-xl shadow-lg overflow-auto"
        style={{ height: "30vh", maxHeight: "30vh" }}
      >
        <div className="sticky top-0 flex justify-between items-center p-3 border-b bg-background">
          <h3 className="font-semibold">Properties</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          {!selectedElement ? (
            <p className="text-muted-foreground text-sm">
              {interactiveMode
                ? "Shift+click an element to edit properties."
                : "Click an element to edit properties."}
            </p>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}