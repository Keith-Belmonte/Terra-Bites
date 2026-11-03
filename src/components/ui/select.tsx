import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

type SelectProps<T extends string> = {
  items: Record<T, string>;
  value: T;
  onValueChange: (value: T | null) => void;
  children?: ReactNode;
};

export function Select<T extends string>({
  items,
  value,
  onValueChange,
  children,
}: SelectProps<T>) {
  const trigger = findTrigger(children);
  return (
    <select
      aria-label="Select an option"
      value={value}
      onChange={(event) => {
        const selected = event.currentTarget.value;
        onValueChange(selected ? (selected as T) : null);
      }}
      className={cn(
        "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        trigger?.props.className,
      )}
    >
      {(Object.keys(items) as T[]).map((key) => (
        <option key={key} value={key}>{items[key]}</option>
      ))}
    </select>
  );
}

function findTrigger(
  children: ReactNode,
): React.ReactElement<{ className?: string; children?: ReactNode }> | undefined {
  let result: React.ReactElement<{ className?: string; children?: ReactNode }> | undefined;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ className?: string; children?: ReactNode }>(child)) {
      if (child.type === SelectTrigger) result = child;
      else if (child.props.children) result = findTrigger(child.props.children) ?? result;
    }
  });
  return result;
}

export function SelectTrigger({ children }: { className?: string; children?: ReactNode }) {
  return <>{children}</>;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ children }: { value: string; children?: ReactNode }) {
  return <>{children}</>;
}
