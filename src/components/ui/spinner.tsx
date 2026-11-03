import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof LoaderCircleIcon>) {
  return (
    <LoaderCircleIcon
      aria-label="Loading"
      role="status"
      className={cn("size-5 animate-spin", className)}
      {...props}
    />
  );
}
