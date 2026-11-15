import { useState } from "react";
import type { ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/tanstack-react-start";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556490496-45afc7b8b8e5?auto=format&fit=crop&w=1600&q=85";

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
    title: "One app for the whole farm cycle",
    subtitle: "Plan, grow, and manage your season",
    description:
      "Check local weather and historical climate, compare crop suitability, plan crop rotations and soil care, explore nearby suppliers, and set farm reminders. Soil photos are a manual texture guide, not an automatic diagnosis.",
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
  const navigate = useNavigate();
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
          Math.min(100, Math.round(100 - Math.abs(m - 75) - Math.abs(n - 70))),
        ),
      },
      {
        cropName: "Mais",
        suitabilityScore: Math.max(
          20,
          Math.min(100, Math.round(100 - Math.abs(m - 45) - Math.abs(n - 50))),
        ),
      },
      {
        cropName: "Kamoteng Kahoy",
        suitabilityScore: Math.max(
          20,
          Math.min(100, Math.round(100 - Math.abs(m - 30) - Math.abs(n - 40))),
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#111713] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-8rem] -z-10 size-[34rem] rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-8 md:grid-cols-2 md:items-center md:gap-14 md:py-10">
        {/* LEFT AREA PANEL: HERO GRAPHIC / SIGN IN PORTAL */}
        <div className="relative h-[56vh] min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#18221b] shadow-2xl shadow-black/30 md:h-[min(78vh,780px)] md:min-h-[620px]">
          <img
            src={HERO_IMAGE}
            alt="Agricultural rice fields"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#08100b]/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5 sm:p-7">
            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-2 backdrop-blur-md">
              <LogoInverse />
            </span>
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border border-white/25",
                  },
                }}
              />
            )}
          </div>

          {/* APP DESCRIPTION TEXT */}
          <div className="absolute inset-x-6 top-24 z-10 max-w-md sm:inset-x-8 sm:top-28">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm">
              <Icon />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight sm:text-4xl text-white">
              {slide.title}
            </h2>
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mt-1">
              {slide.subtitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-xs">
              {slide.description}
            </p>
            <p className="font-serif text-3xl font-semibold">Set a location</p>
            <p className="text-white/85">Start with GPS or search for a place.</p>
          </div>

          {/* BOTTOM METRIC PANEL OR AUTH INITIATION */}
          <div className="absolute inset-x-5 bottom-5 z-10 max-w-md sm:inset-x-7 sm:bottom-7">
            {!isSignedIn ? (
              <div className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl text-center">
                <p className="text-sm text-white/80 mb-4">
                  Sign in to view your field dashboard and recommendations.
                </p>
                <SignInButton mode="modal">
                  <button className="w-full rounded-xl bg-emerald-400 py-3 text-sm font-bold text-[#102018] shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-300">
                    Authenticate Account Gateway
                  </button>
                </SignInButton>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex flex-wrap gap-1.5 rounded-2xl border border-white/15 bg-black/35 p-1.5 backdrop-blur-xl">
                  {allAvailableFields.map((field, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFieldIndex(idx)}
                      className={`rounded-xl px-3 py-2 text-[11px] font-medium transition-all ${
                        activeFieldIndex === idx
                          ? "bg-emerald-400 font-bold text-[#102018]"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {field.name.split(" ")[0]}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-xl sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
                        Soil Moisture Layer
                      </p>
                      <p className="mt-1 text-5xl font-semibold leading-none tracking-tight text-white">
                        {primaryField.soilMoisture}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
                        Rainfall
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        {primaryField.weather.totalRainfall} mm
                      </p>
                      <p className="text-xs capitalize text-white/65">
                        {primaryField.weather.droughtRisk} drought risk
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-white">
                    {primaryField.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] tracking-wide text-white/60">
                    {primaryField.latitude.toFixed(2)}°N,{" "}
                    {primaryField.longitude.toFixed(2)}°E
                  </p>
                </div>
                {primaryField.activeAlerts &&
                  primaryField.activeAlerts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {primaryField.activeAlerts.map((alert) => (
                        <div
                          key={alert.title}
                          className={`rounded-xl border p-3 text-xs leading-relaxed backdrop-blur-md ${
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
          </div>
        </div>

        <div className="flex flex-col justify-center px-1 py-5 sm:px-3 md:px-0 md:py-0">
          <div className="max-w-xl space-y-7">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-3xl text-emerald-200 shadow-lg shadow-emerald-950/20">
              <Icon />
            </div>

            {isSignedIn ? (
              <>
                <div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                    Welcome back,{" "}
                    <span className="text-emerald-300">
                      {user?.firstName || "farmer"}
                    </span>
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                    {slide.description}
                  </p>
                </div>

                <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                    Crop suitability · sample estimate
                  </h2>
                  <div className="mt-4 space-y-3">
                    {primaryField.cropRankings?.map((crop) => (
                      <div
                        key={crop.cropName}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-slate-300">{crop.cropName}</span>
                        <span className="font-mono font-semibold text-emerald-300">
                          {crop.suitabilityScore}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/home" })}
                    className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-bold text-[#102018] transition hover:bg-emerald-200"
                  >
                    Open dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/insights" })}
                    className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View insights
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                    Better decisions,
                    <span className="mt-1 block text-emerald-300">
                      start in your field.
                    </span>
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                    From choosing a crop and planning rotations to checking
                    local weather, finding nearby fertilizer suppliers, and
                    keeping farm tasks on track, TerraBites brings practical
                    tools for your season together.
                  </p>
                </div>
                <SignInButton mode="redirect" forceRedirectUrl="/home">
                  <button
                    type="button"
                    className="w-fit rounded-full bg-emerald-300 px-7 py-3.5 text-sm font-bold text-[#102018] shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-200"
                  >
                    Sign in to get started
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
