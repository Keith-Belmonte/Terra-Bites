import { Link } from "@tanstack/react-router";
import {
  BotMessageSquareIcon,
  ChartAreaIcon,
  HouseIcon,
  LayoutDashboardIcon,
  MapIcon,
  SproutIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import type { RoutePath } from "@/router.tsx";
import Logo from "@/components/ui/logo.tsx";
import ThemeToggle from "@/components/ui/theme-toggle.tsx";

const TABS: Array<{ label: string; to: RoutePath; icon: LucideIcon }> = [
  { label: "Home", to: "/home", icon: HouseIcon },
  { label: "Insights", to: "/insights", icon: ChartAreaIcon },
  { label: "Maps", to: "/maps", icon: MapIcon },
  { label: "Crops", to: "/crops", icon: SproutIcon },
  { label: "Assistant", to: "/assistant", icon: BotMessageSquareIcon },
  { label: "Profile", to: "/profile", icon: UserRoundIcon },
];

const SIDE_TABS: Array<{ label: string; to: RoutePath; icon: LucideIcon }> = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboardIcon },
  ...TABS,
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {TABS.map(({ label, to, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 text-[10px] leading-none font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <span className="grid h-8 w-10 place-items-center rounded-full transition-colors group-data-[status=active]:bg-secondary">
                <Icon className="size-[22px]" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
      <Link to="/home" className="cursor-pointer px-2 pb-8">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {SIDE_TABS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-base font-semibold text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex items-center justify-between rounded-xl bg-sidebar-accent/60 px-3 py-2 text-sm text-muted-foreground">
        Appearance
        <ThemeToggle />
      </div>
    </aside>
  );
}
