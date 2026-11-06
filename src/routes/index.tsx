import { useState } from "react";
import { useQuery } from "convex/react";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";

// Simple asset/component placeholders matching your local app signature
const HERO_IMAGE = "https://unsplash.com";

function LogoInverse() {
  return <span className="font-bold tracking-tight text-emerald-400">🌾 TerraBites</span>;
}

function ThemeToggle() {
  return <button className="p-1 text-xs uppercase opacity-80 hover:opacity-100">Theme</button>;
}

function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return <a href={to} className={className}>{children}</a>;
}

const SLIDES = [
  {
    icon: () => <span>🌱</span>,
    title: "Terra Bites",
    subtitle: "Precision Agronomy System",
    description: "Real-time crop tracking and satellite soil analysis optimized for high-yield food security thresholds."
  }
];

export function Welcome() {
  const [index] = useState(0);

  // 1. Simulation Form States for Interactive Slider Controls
  const [formName, setFormName] = useState("Bicol Rice Plot Alpha");
  const [moisture, setMoisture] = useState(22);
  const [nit, setNit] = useState(35);
  const [phos, setPhos] = useState(55);
  const [pot, setPot] = useState(62);
  
  // 2. Consume backend cloud aggregator query endpoint
  const dashboardData = useQuery(api.user.getDashboardData);
  
  // 3. Construct live simulated field data mapping to interactive sliders
  const fields = dashboardData?.fields ?? [
    {
      name: formName,
      soilMoisture: moisture,
      nitrogen: nit,
      phosphorus: phos,
      potassium: pot,
      activeAlerts: [
        ...(moisture < 30 ? [{ type: "danger", title: "Critical Water Stress", message: `Soil moisture is severely low (${moisture}%).` }] : []),
        ...(moisture > 85 ? [{ type: "warning", title: "Water Logging Risk", message: `Moisture is highly saturated (${moisture}%).` }] : []),
        ...(nit < 40 ? [{ type: "warning", title: "Nitrogen Deficiency", message: `Nitrogen levels are low (${nit} ppm).` }] : [])
      ],
      cropRankings: [
        { cropName: "Palay", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(moisture - 75) - Math.abs(nit - 70)))) },
        { cropName: "Mais", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(moisture - 45) - Math.abs(nit - 50)))) },
        { cropName: "Kamoteng Kahoy", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(moisture - 30) - Math.abs(nit - 40)))) }
      ].sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    }
  ];

const primaryField = fields.length > 0 ? fields[0] : null;
  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1c1c1a]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 md:items-center md:gap-12 md:px-8">
        
        {/* Left Column: Visual Card Render State Area */}
        <div className="relative h-[46vh] min-h-[400px] md:h-[80vh] md:overflow-hidden md:rounded-[2rem]">
          <img
            src={HERO_IMAGE}
            alt="Aerial view of green rice terraces"
            className="absolute inset-0 h-full w-full object-cover rounded-[2rem]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#1c1c1a] md:to-black/60 rounded-[2rem]" />
          
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
              <LogoInverse />
            </span>
            <span className="rounded-full bg-black/30 text-white backdrop-blur-sm px-3 py-1.5">
              <ThemeToggle />
            </span>
          </div>

          <div className="absolute bottom-8 left-8 max-w-sm text-white">
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              Soil moisture today
            </p>
            <p className="font-serif text-6xl font-semibold my-1">
              {primaryField ? `${primaryField.soilMoisture}%` : "No Data"}
            </p>
            <p className="text-white/80 text-sm">
              {primaryField ? `Field: ${primaryField.name}` : "Please add a field to get started"}
            </p>
            
            {/* Live Alerts Dynamic View Box */}
            {primaryField?.activeAlerts && primaryField.activeAlerts.length > 0 && (
              <div className="mt-4 space-y-2 max-w-xs">
                {primaryField.activeAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-2 text-xs rounded border backdrop-blur-md transition-all duration-300 ${
                    alert.type === 'danger' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                  }`}>
                    <strong>⚠️ {alert.title}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Descriptions & Controller Matrices */}
        <div className="flex flex-col justify-center px-4 py-8 md:px-0">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 text-2xl">
              <Icon />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {slide.title}
              </h1>
              <p className="text-xl text-gray-400">{slide.subtitle}</p>
            </div>
            <p className="text-sm leading-6 text-gray-400 max-w-md">
              {slide.description}
            </p>
            
            {/* Dynamic Crop Suitability Rankings Matrix Display */}
            {primaryField?.cropRankings && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md">
                <h3 className="text-xs font-semibold text-white/70 mb-2.5 uppercase tracking-wider">💡 Top Suitability Match</h3>
                <div className="space-y-2">
                  {primaryField.cropRankings.map((crop: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm items-center border-b border-white/5 pb-1 last:border-0">
                      <span className="text-gray-300">{crop.cropName}</span>
                      <span className="font-mono text-emerald-400 font-bold">{crop.suitabilityScore}% Match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Simulation Panel Sliders System */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 max-w-md space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🎛️ Real-Time Field Matrix Simulator</h3>
              
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Field Plot Title Name</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Soil Moisture Metric</span>
                    <span className="text-emerald-400 font-mono font-bold">{moisture}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={moisture} onChange={(e) => setMoisture(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Nitrogen Level (N)</span>
                    <span className="text-emerald-400 font-mono font-bold">{nit} ppm</span>
                  </div>
                  <input type="range" min="0" max="120" value={nit} onChange={(e) => setNit(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-600 w-full sm:w-auto text-center"
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

// === TANSTACK ROUTER BINDING CONTRACT ===
export const Route = createFileRoute("/")({
  component: Welcome,
});
