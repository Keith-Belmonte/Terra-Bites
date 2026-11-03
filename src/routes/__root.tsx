import { ClerkProvider } from "@clerk/tanstack-react-start";
import type { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { ConvexReactClient } from "convex/react";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import ConvexAppProvider from "@/components/providers/convex.tsx";
import FarmProvider from "@/components/providers/farm-provider.tsx";
import ThemeProvider from "@/components/providers/theme.tsx";
import RouteError from "@/components/ui/route-error.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { site } from "@/lib/site.ts";
import appCss from "@/index.css?url";

const fetchClerkToken = createServerFn({ method: "GET" }).handler(async () => {
  const { getToken } = await auth();
  return getToken();
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  beforeLoad: async (ctx) => {
    const serverHttpClient = ctx.context.convexQueryClient.serverHttpClient;
    if (!serverHttpClient) return;
    const token = await fetchClerkToken();
    if (token) serverHttpClient.setAuth(token);
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { name: "theme-color", content: "#2f6b3f" },
      { title: site.name },
      { name: "description", content: site.tagline },
      { property: "og:title", content: site.name },
      { property: "og:description", content: site.tagline },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  errorComponent: RootRouteError,
  notFoundComponent: NotFound,
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  const { convexClient } = Route.useRouteContext();
  return (
    <FarmProvider>
      <ConvexAppProvider client={convexClient}>
        <Outlet />
      </ConvexAppProvider>
    </FarmProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider>
          <TooltipProvider>
          <Toaster />
          {children}
          </TooltipProvider>
          </ThemeProvider>
          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  );
}

function RootRouteError(props: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <RouteError {...props} />
    </div>
  );
}

function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <meta name="robots" content="noindex" />
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          This page does not exist.
        </p>
        <div className="pt-4">
          <Link to="/" className={buttonVariants()}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}