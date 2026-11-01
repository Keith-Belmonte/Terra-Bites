import { SproutIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function Logo({
  className,
  showText = true,
  inverse = false





}: {className?: string;showText?: boolean; /** For use on photos or the green brand band. */inverse?: boolean;}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl shadow-sm",
          inverse ?
          "bg-white text-[#2f6b3f]" :
          "bg-primary text-primary-foreground"
        )}>
        
        <SproutIcon className="size-5" strokeWidth={2.4} />
      </span>
      {showText &&
      <span
        className={cn(
          "font-serif text-xl font-semibold tracking-tight",
          inverse && "text-white"
        )}>
        
          Terra
          <span className={inverse ? "text-[#f3d27a]" : "text-primary"}>Bites

        </span>
        </span>
      }
    </span>);

}