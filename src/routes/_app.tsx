import { Outlet, createFileRoute } from "@tanstack/react-router";
import FarmProvider from "@/components/providers/farm-provider.tsx";
import { BottomNav, SideNav } from "@/components/ui/app-nav.tsx";

export const Route = createFileRoute("/_app")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <FarmProvider>
      <div className="flex min-h-screen bg-background">
        <SideNav />
        <main className="min-w-0 flex-1 pb-24 md:pb-10">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </FarmProvider>
  );
}
