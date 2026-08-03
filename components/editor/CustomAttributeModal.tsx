"use client";

interface CustomAttributeModalProps {
  attrKey: string;
  attrValue: string;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onCancel: () => void;
  onAdd: () => void;
}

export function CustomAttributeModal({
  attrKey,
  attrValue,
  onKeyChange,
  onValueChange,
  onCancel,
  onAdd,
}: CustomAttributeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Add Custom Attribute</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={attrKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="Attribute name"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            value={attrValue}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Value"
            className="w-full p-2 border rounded-md"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onCancel} className="px-3 py-1.5 border rounded-md">
              Cancel
            </button>
            <button
              onClick={onAdd}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
