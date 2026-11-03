import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";

type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
};

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step,
  className,
  ...props
}: SliderProps) {
  return (
    <input
      {...props}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => onValueChange?.(Number(event.currentTarget.value))}
      className={cn("w-full accent-primary", className)}
    />
  );
}
