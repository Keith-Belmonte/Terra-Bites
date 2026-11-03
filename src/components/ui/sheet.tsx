import type { HTMLAttributes, ReactNode } from "react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils.ts";

export const Sheet = Primitive.Root;
export const SheetTrigger = Primitive.Trigger;
export const SheetClose = Primitive.Close;

export function SheetContent({
  side = "right",
  className,
  children,
}: {
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: ReactNode;
}) {
  const position =
    side === "bottom"
      ? "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl"
      : side === "top"
        ? "inset-x-0 top-0 max-h-[90vh] rounded-b-2xl"
        : side === "left"
          ? "inset-y-0 left-0 h-full w-[min(24rem,90vw)]"
          : "inset-y-0 right-0 h-full w-[min(24rem,90vw)]";
  return (
    <Primitive.Portal>
      <Primitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
      <Primitive.Viewport className="fixed inset-0 z-50 overflow-y-auto">
        <Primitive.Popup
          className={cn(
            "fixed flex flex-col gap-4 border border-border bg-background p-4 text-foreground shadow-xl outline-none",
            position,
            className,
          )}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Viewport>
    </Primitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 px-4 pb-2", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Primitive.Title
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Primitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 border-t border-border pt-4", className)} {...props} />;
}
