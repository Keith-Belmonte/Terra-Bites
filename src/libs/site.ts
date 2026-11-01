import type { RoutePath } from "@/router.tsx";

type Site = {
  name: string;
  tagline: string;
  nav: Array<{ label: string; to: RoutePath }>;
};

export const site: Site = {
  name: "TerraBites",
  tagline:
    "Smarter farming with NASA data and AI. Crop recommendations, field conditions, and a farming assistant for your exact location.",
  nav: [
    { label: "Home", to: "/home" },
    { label: "Insights", to: "/insights" },
    { label: "Crops", to: "/crops" },
    { label: "Assistant", to: "/assistant" },
    { label: "Profile", to: "/profile" },
  ],
};
