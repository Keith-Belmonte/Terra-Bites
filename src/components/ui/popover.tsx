import { Popover as Primitive } from "@base-ui/react/popover";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;

export function PopoverContent({
  className,
  align = "center",
  children,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner align={align} sideOffset={8} className="z-50">
        <Primitive.Popup
          className={cn(
            "rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg outline-none",
            className,
          )}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

export function PopoverAnchor({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}
