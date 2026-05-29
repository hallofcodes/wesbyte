"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const actions = [
  { label: "None", value: "" },
  { label: "Alert('Hello!')", value: "() => alert('Hello!')" },
  { label: "Console.log('Clicked')", value: "() => console.log('Clicked')" },
  { label: "Navigate to /", value: "() => window.location.href = '/'" },
  { label: "Open new tab (google.com)", value: "() => window.open('https://google.com', '_blank')" },
];

export function EventHandler({
  value,
  onChange,
}: {
  value: string;
  onChange: (newValue: string) => void;
}) {
  // Ensure value is string
  const safeValue = typeof value === "string" ? value : "";

  return (
    <Select
      value={safeValue}
      onValueChange={(val) => {
        const action = actions.find((a) => a.value === val);
        onChange(action?.value ?? "");
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select action" />
      </SelectTrigger>
      <SelectContent>
        {actions.map((action) => (
          <SelectItem key={action.value} value={action.value}>
            {action.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}