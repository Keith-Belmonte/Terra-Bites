import { useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/tanstack-react-start";

const HERO_IMAGE =
  "https://unsplash.com";

function LogoInverse() {
  return (
    <span className="font-bold tracking-tight text-emerald-400">
      🌾 TerraBites
    </span>
  );
}

interface SlideType {
  icon: () => ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: SlideType[] = [
  {
    icon: () => <span>🌱</span>,
    title: "TerraBites",
    subtitle: "Precision Agronomy System",
    description:
      "Real-time crop tracking and satellite soil analysis optimized for high-yield food security thresholds.",
  },
];

interface WeatherType {
  totalRainfall: number;
  droughtRisk: string;
  recommendation: string;
}

interface AlertType {
  type: string;
  title: string;
  message: string;
}

interface CropRankingType {
  cropName: string;
  suitabilityScore: number;
}

interface FieldData {
  name: string;
  soilMoisture: number;
  nitrogen: number;
  latitude: number;
  longitude: number;
  weather: WeatherType;
  activeAlerts?: AlertType[];
  cropRankings?: CropRankingType[];
}

export const Route = createFileRoute("/")({
  component: Welcome,
});

export function Welcome() {
  const { isLoaded, user } = useUser();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  const [formName, setFormName] = useState("Isabela Plot");
  const [moisture, setMoisture] = useState(65);
  const [nit, setNit] = useState(60);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);

  if (!isLoaded || !isAuthLoaded) {
    return (
      <div className="min-h-screen bg-[#1c1c1a] flex items-center justify-center text-white font-mono text-xs tracking-wider">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING SECURITY LOCKOUT GATES...</span>
        </div>
      </div>
    );
  }

  const processFieldData = (field: FieldData): FieldData => {
    const m = field.soilMoisture;
    const n = field.nitrogen;

    const activeAlerts: AlertType[] = [
      ...(m < 30
        ? [
            {
              type: "danger",
              title: "Critical Water Stress",
              message: `Soil moisture is severely low (${m}%).`,
            },
          ]
        : []),
      ...(m > 85
        ? [
            {
              type: "warning",
              title: "Water Logging Risk",
              message: `Moisture is highly saturated (${m}%).`,
            },
          ]
        : []),
      ...(n < 40
        ? [
            {
              type: "warning",
              title: "Nitrogen Deficiency",
              message: `Nitrogen levels are low (${n} ppm).`,
            },
          ]
        : []),
    ];

    const cropRankings: CropRankingType[] = [
      {
        cropName: "Palay",
        suitabilityScore: Math.max(
          20,
          Math.min(
            100,
            Math.round(100 - Math.abs(m - 75) - Math.abs(n - 70))
          )
        ),
      },
      {
        cropName: "Mais",
        suitabilityScore: Math.max(
          20,
          Math.min(
            100,
            Math.round(100 - Math.abs(m - 45) - Math.abs(n - 50))
          )
        ),
      },
      {
        cropName: "Kamoteng Kahoy",
        suitabilityScore: Math.max(
          20,
          Math.min(
            100,
            Math.round(100 - Math.abs(m - 30) - Math.abs(n - 40))
          )
        ),
      },
    ].sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return {
      ...field,
      activeAlerts,
      cropRankings,
    };
  };

  const allAvailableFields: FieldData[] = [
    processFieldData({
      name: `${formName} (Simulated)`,
      soilMoisture: moisture,
      nitrogen: nit,
      latitude: 16.97,
      longitude: 121.81,
      weather: {
        totalRainfall: 164,
        droughtRisk: "low",
        recommendation:
          "Climate parameters remain ideal for routine crop cultivation cycles.",
      },
    }),
    processFieldData({
      name: "Bicol Rice Plot Alpha",
      soilMoisture: 22,
      nitrogen: 35,
      latitude: 14.11,
      longitude: 122.95,
      weather: {
        totalRainfall: 42,
        droughtRisk: "moderate",
        recommendation:
          "Slight soil drying trend observed. Monitor shallow root zones closely.",
      },
    }),
    processFieldData({
      name: "Cagayan Corn Plot Delta",
      soilMoisture: 45,
      nitrogen: 75,
      latitude: 18.21,
      longitude: 121.73,
      weather: {
        totalRainfall: 285,
        droughtRisk: "low",
        recommendation:
          "Excessive moisture volumes detected. Verify active field drainage gates.",
      },
    }),
  ];

  const primaryField =
    allAvailableFields[activeFieldIndex] ?? allAvailableFields[0];

  const slide = SLIDES[0];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1c1c1a] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 md:items-center md:gap-12 md:px-8">
        
        {/* LEFT AREA PANEL */}
        <div className="relative h-[46vh] min-h-[400px] md:h-[80vh] md:overflow-hidden md:rounded-[2rem]">
          <img
            src={HERO_IMAGE}
            alt="Agricultural rice fields"
            className="absolute inset-0 h-full w-full rounded-[2rem] object-cover"
          />
          <div className="absolute inset-0 rounded-[2rem] bg-black/50" />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6">
            <LogoInverse />
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 border border-white/20",
                  },
                }}
              />
            )}
          </div>

          {/* LOGGED-IN METRIC OVERLAY */}
          {isSignedIn && (
            <div className="absolute bottom-8 left-8 z-10 w-[calc(100%-4rem)] max-w-sm">
              <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
                {allAvailableFields.map((field, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveFieldIndex(idx)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      activeFieldIndex === idx
                        ? "bg-emerald-500 font-bold text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {field.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Soil moisture today
              </p>
              <p className="my-1 font-serif text-6xl font-semibold">
                {primaryField.soilMoisture}%
              </p>
              <p className="text-sm text-white/80">
                Active View: {primaryField.name}
              </p>
              <p className="mt-0.5 font-mono text-[11px] tracking-wider text-emerald-400">
                📍 GPS: {primaryField.latitude.toFixed(2)}°N,{" "}
                {primaryField.longitude.toFixed(2)}°E
              </p>

              {primaryField.activeAlerts && primaryField.activeAlerts.length > 0 && (
                <div className="mt-4 max-w-xs space-y-2">
                  {primaryField.activeAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`rounded border p-2 text-xs backdrop-blur-md ${
                        alert.type === "danger"
                          ? "border-red-500/50 bg-red-500/20 text-red-200"
                          : "border-yellow-500/50 bg-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      <strong>⚠️ {alert.title}:</strong> {alert.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOGGED-OUT VISUAL GUIDE OVERLAY */}
          {!isSignedIn && (
            <div className="absolute bottom-8 left-8 right-8 z-10 max-w-md">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Core Guard active
              </span>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-white">
                Secure Data Isolation Gateway
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                Log in to authenticate telemetry signatures, switch spatial plots, and access algorithmic soil calculations.
              </p>
              <div className="mt-4">
                <SignInButton mode="redirect" forceRedirectUrl="/">
                  <button
                    type="button"
                    className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-300"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT DYNAMIC CONTROLS PANEL */}
        <div className="flex flex-col justify-center px-4 py-8 md:px-0">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 text-2xl">
              <Icon />
            </div>

            <div>
              {isSignedIn ? (
                <>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Welcome back,{" "}
                    <span className="text-emerald-400">
                      {user?.firstName || "Operator"}
                    </span>
                  </h1>

                  <p className="mt-4 text-base text-slate-300">
                    {slide.subtitle}
                  </p>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                    {slide.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                      View crop insights
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Inspect fields
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Precision agronomy,
                    <span className="block text-emerald-400">secured for your fields</span>
                  </h1>

                  <p className="mt-4 text-base text-slate-300">
                    {slide.subtitle}
                  </p>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                    {slide.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SignInButton mode="redirect" forceRedirectUrl="/">
                      <button
                        type="button"
                        className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
