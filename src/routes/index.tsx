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
import Logo from "@/components/logo.tsx";
import ThemeToggle from "@/components/theme-toggle.tsx";
import { cn } from "@/lib/utils.ts";
import { site } from "@/lib/site.ts";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556490496-45afc7b8b8e5?auto=format&fit=crop&w=1400&q=75";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} | Smarter farming with NASA data and AI` },
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
    title: "NASA data, made simple",
    body: "Soil moisture, rainfall, temperature and plant health from NASA satellites, explained in plain words.",
    stat: "5 satellite data sets",
  },
  {
    icon: MapPinIcon,
    title: "Advice for your exact field",
    body: "Your GPS location tells us your climate and soil, so crop picks and alerts fit your farm.",
    stat: "Updated for your location",
  },
  {
    icon: BotMessageSquareIcon,
    title: "Ask Siesta, your AI assistant",
    body: "Ask anything, like when to plant rice or how to handle a dry spell, and get a clear answer.",
    stat: "Answers in seconds",
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
              Soil moisture today
            </p>
            <p className="font-serif text-6xl font-semibold">34%</p>
            <p className="text-white/85">
              Good for land preparation in Nueva Ecija
            </p>
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
            <span className="text-primary italic">NASA data</span> and AI.
          </motion.h1>
          <p className="pt-4 text-lg text-muted-foreground">
            Know what to plant, when to plant it, and how to protect it, for
            your own field.
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
              render={<Link to="/home" />}
              nativeButton={false}
            >
              Sign In
            </Button>
          </div>
          <p className="pt-4 text-center text-xs text-muted-foreground">
            Insights use NASA POWER, SMAP, MODIS and GPM public data.
          </p>
        </div>
      </div>
    </div>
  );
}
