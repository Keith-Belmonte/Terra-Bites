import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
  component: Welcome,
});

const HERO_IMAGE =
  "https://unsplash.com";

const SLIDES = [
  {
    title: "Terra Bites",
    subtitle: "Precision Agronomy System",
    description: "Real-time crop tracking and satellite soil analysis.",
    icon: () => (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

function ThemeToggle() {
  return (
    <button className="p-2 text-white/80 hover:text-white transition">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.242 17.657l.707-.707M6.343 6.343l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
      </svg>
    </button>
  );
}

function LogoInverse() {
  return (
    <div className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
      <span className="text-emerald-400">🌾</span> TerraBites
    </div>
  );
}

function Welcome() {
  const [index, setIndex] = useState(0);
  const fields = useQuery(api.user.getMyFields);
  const primaryField = fields && fields.length > 0 ? fields[0] : null;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-2 md:items-center md:gap-12 md:px-8">
        <div className="relative h-[46vh] min-h-80 md:h-[80vh] md:overflow-hidden md:rounded-[2rem]">
          <img
            src={HERO_IMAGE}
            alt="Aerial view of green rice terraces"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background md:to-black/50" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
              <LogoInverse />
            </span>
            <span className="rounded-full bg-black/30 text-white backdrop-blur-sm [&_button:hover]:bg-white/15 [&_button]:text-white">
              <ThemeToggle />
            </span>
          </div>

          <div className="absolute bottom-8 left-6 hidden max-w-sm text-white md:block">
            <p className="text-sm font-semibold tracking-widest text-white/80 uppercase">
              Soil moisture today
            </p>
            <p className="font-serif text-6xl font-semibold">
              {primaryField ? `${primaryField.soilMoisture}%` : "No Data"}
            </p>
            <p className="text-white/85">
              {primaryField ? `Field: ${primaryField.name}` : "Please add a field to get started"}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-8 md:px-0">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Icon />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {slide.title}
              </h1>
              <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
            </div>
            <p className="text-base leading-7 text-muted-foreground max-w-md">
              {slide.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 font-semibold text-white hover:bg-emerald-400 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
