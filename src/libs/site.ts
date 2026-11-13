import type { RoutePath } from "@/router.tsx";

type Site = {
  name: string;
  tagline: string;
  nav: Array<{ label: string; to: RoutePath }>;
};

export const site: Site = {
  name: "TerraBites",
  tagline:
    "Location-aware farm weather, historical analysis, crop suitability, and an AI-powered farming assistant.",
  nav: [
    { label: "Home", to: "/home" },
    { label: "Insights", to: "/insights" },
    { label: "Crops", to: "/crops" },
    { label: "Assistant", to: "/assistant" },
    { label: "Profile", to: "/profile" },
  ],
};
