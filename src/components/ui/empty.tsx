import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export function Empty({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("flex flex-col items-center justify-center gap-4 p-8 text-center", className)}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col items-center gap-2", className)} {...props} />;
}

export function EmptyMedia({
  variant,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "icon" }) {
  return (
    <div
      className={cn(
        "grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold", className)} {...props} />;
}

export function EmptyDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("max-w-sm text-sm text-muted-foreground", className)} {...props} />;
}

export function EmptyContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={cn("pt-2", className)} {...props}>{children}</div>;
}
