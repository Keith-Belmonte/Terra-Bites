import type { HTMLAttributes, ReactNode } from "react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils.ts";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Primitive.Portal>
      <Primitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-[open]:animate-in data-[closed]:animate-out" />
      <Primitive.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
        <Primitive.Popup
          className={cn(
            "w-full max-w-lg rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl outline-none",
            className,
          )}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Viewport>
    </Primitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 pb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Primitive.Title
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
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

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end", className)} {...props} />;
}
