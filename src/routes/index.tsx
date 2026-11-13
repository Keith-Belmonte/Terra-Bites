import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRightIcon,
  BotMessageSquareIcon,
  MapPinIcon,
  SatelliteIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Logo from "@/components/ui/logo.tsx";
import ThemeToggle from "@/components/ui/theme-toggle.tsx";
import { cn } from "@/lib/utils.ts";
import { site } from "@/lib/site.ts";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556490496-45afc7b8b8e5?auto=format&fit=crop&w=1400&q=75";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} | Live farm weather and AI` },
      { name: "description", content: site.tagline },
      { property: "og:title", content: `${site.name} | Smarter farming` },
      { property: "og:description", content: site.tagline },
    ],
  }),
  component: Welcome,
});

type Slide = { icon: LucideIcon; title: string; body: string; stat: string };

const SLIDES: Slide[] = [
  {
    icon: SatelliteIcon,
    title: "Real weather, made useful",
    body: "Explore current forecasts and historical temperature, rainfall, and modelled surface soil-moisture data.",
    stat: "Open-Meteo live forecast",
  },
  {
    icon: MapPinIcon,
    title: "Advice for your exact field",
    body: "Compare local forecast readings with crop reference traits and the soil information you enter.",
    stat: "GPS or place search",
  },
  {
    icon: BotMessageSquareIcon,
    title: "Ask Siesta, powered by Cloudflare Workers AI",
    body: "Get farming guidance grounded in your prompt and current weather context, with important limitations called out.",
    stat: "Server-side AI",
  },
];

function Welcome() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl md:grid-cols-2 md:items-center md:gap-12 md:px-8">
        {/* Photo hero */}
        <div className="relative h-[46vh] min-h-80 md:h-[80vh] md:overflow-hidden md:rounded-[2rem]">
          <img
            src={HERO_IMAGE}
            alt="Aerial view of green rice terraces"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-background md:to-black/50" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
              <Logo inverse />
            </span>
            <span className="rounded-full bg-black/30 text-white backdrop-blur-sm [&_button:hover]:bg-white/15 [&_button]:text-white">
              <ThemeToggle />
            </span>
          </div>
          <div className="absolute bottom-8 left-6 hidden max-w-sm text-white md:block">
            <p className="text-sm font-semibold tracking-widest text-white/80 uppercase">
              Your field, your forecast
            </p>
            <p className="font-serif text-3xl font-semibold">Set a location</p>
            <p className="text-white/85">Start with GPS or search for a place.</p>
          </div>
        </div>

        {/* Copy + onboarding */}
        <div className="relative -mt-16 flex flex-col px-5 pb-8 md:mt-0 md:px-0">
          <motion.h1
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-serif text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl"
          >
            Smarter farming with{" "}
            <span className="text-primary italic">real weather</span> and AI.
          </motion.h1>
          <p className="pt-4 text-lg text-muted-foreground">
            Analyze local forecasts, compare crop requirements, and ask an AI assistant for practical guidance.
          </p>

          <section
            aria-label="How TerraBites helps"
            className="mt-7 rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex gap-4"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Icon className="size-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wider text-primary uppercase">
                    {slide.stat}
                  </p>
                  <h2 className="pt-1 text-xl font-bold">{slide.title}</h2>
                  <p className="pt-1 text-muted-foreground">{slide.body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between pt-5">
              <div className="flex gap-2" role="tablist">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show slide ${i + 1}: ${s.title}`}
                    onClick={() => setIndex(i)}
                    className="flex h-8 cursor-pointer items-center"
                  >
                    <span
                      className={cn(
                        "block h-2.5 rounded-full transition-all",
                        i === index ? "w-8 bg-primary" : "w-2.5 bg-border",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full font-semibold"
                onClick={() => setIndex(isLast ? 0 : index + 1)}
              >
                {isLast ? "Start over" : "Next"}
                <ArrowRightIcon />
              </Button>
            </div>
          </section>

          <div className="flex flex-col gap-3 pt-6">
            <Button
              size="lg"
              className="h-14 rounded-2xl text-base font-bold"
              render={<Link to="/location" />}
              nativeButton={false}
            >
              Get Started
              <ArrowRightIcon className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-14 rounded-2xl text-base font-bold"
              render={<Link to="/auth/sign-in" />}
              nativeButton={false}
            >
              Sign In
            </Button>
          </div>
          <p className="pt-4 text-center text-xs text-muted-foreground">
            Weather by Open-Meteo · AI by Cloudflare Workers AI.
          </p>
        </div>
      </div>
    </div>
  );
}
