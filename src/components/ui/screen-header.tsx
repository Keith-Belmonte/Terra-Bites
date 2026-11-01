import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import type { RoutePath } from "@/router.tsx";
import { Button } from "@/components/ui/button.tsx";

/** Sticky top bar for in-app screens. */
export default function ScreenHeader({
  title,
  subtitle,
  backTo,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  backTo?: RoutePath;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {backTo && (
          <Button
            variant="ghost"
            size="icon-lg"
            render={<Link to={backTo} />}
            nativeButton={false}
            aria-label="Go back"
            className="-ml-2 rounded-full"
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
