"use client";

export default function EventHandler({
  value,
  onChange,
}: {
  value: string;
  onChange: (newValue: string) => void;
}) {
  const actions = [
    { label: "None", value: "none" },
    { label: "Alert('Hello!')", value: "() => alert('Hello!')" },
    { label: "Console.log('Clicked')", value: "() => console.log('Clicked')" },
    { label: "Navigate to /", value: "() => window.location.href = '/'" },
    { label: "Open new tab (google.com)", value: "() => window.open('https://google.com', '_blank')" },
  ];

  const internalValue = value === "" ? "none" : value;

  return (
    <select
      className="w-full p-2 border rounded-md bg-background"
      value={internalValue}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "none" ? "" : val);
      }}
    >
      {actions.map((action) => (
        <option key={action.value} value={action.value}>
          {action.label}
        </option>
      ))}
    </select>
  );
}