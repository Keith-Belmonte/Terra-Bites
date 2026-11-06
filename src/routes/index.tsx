import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

const HERO_IMAGE = "https://unsplash.com";

function LogoInverse() {
  return <span className="font-bold tracking-tight text-emerald-400">🌾 TerraBites</span>;
}

function ThemeToggle() {
  return <button className="p-1 text-xs uppercase opacity-80 hover:opacity-100">Theme</button>;
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
  // 1. Interactive Simulator States
  const [formName, setFormName] = useState("Isabela Plot");
  const [moisture, setMoisture] = useState(65);
  const [nit, setNit] = useState(60);
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);

  // 2. Generate dynamic calculations directly inside client memory
  const processFieldData = (field: any) => {
    const m = field.soilMoisture;
    const n = field.nitrogen;
    return {
      ...field,
      activeAlerts: [
        ...(m < 30 ? [{ type: "danger", title: "Critical Water Stress", message: `Soil moisture is severely low (${m}%).` }] : []),
        ...(m > 85 ? [{ type: "warning", title: "Water Logging Risk", message: `Moisture is highly saturated (${m}%).` }] : []),
        ...(n < 40 ? [{ type: "warning", title: "Nitrogen Deficiency", message: `Nitrogen levels are low (${n} ppm).` }] : [])
      ],
      cropRankings: [
        { cropName: "Palay", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(m - 75) - Math.abs(n - 70)))) },
        { cropName: "Mais", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(m - 45) - Math.abs(n - 50)))) },
        { cropName: "Kamoteng Kahoy", suitabilityScore: Math.max(20, Math.min(100, Math.round(100 - Math.abs(m - 30) - Math.abs(n - 40)))) }
      ].sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    };
  };

  // 3. Multi-Field Tabs Array Dataset
  const allAvailableFields = [
    processFieldData({ name: `${formName} (Simulated)`, soilMoisture: moisture, nitrogen: nit }),
    processFieldData({ name: "Bicol Rice Plot Alpha", soilMoisture: 22, nitrogen: 35 }),
    processFieldData({ name: "Cagayan Corn Plot Delta", soilMoisture: 45, nitrogen: 75 })
  ];
  
  const primaryField = allAvailableFields[activeFieldIndex < allAvailableFields.length ? activeFieldIndex : 0];
  const slide = SLIDES[0];
  const Icon = slide.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1c1c1a] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 md:items-center md:gap-12 md:px-8">
        
        {/* Left Column: Card Image Display */}
        <div className="relative h-[46vh] min-h-[400px] md:h-[80vh] md:overflow-hidden md:rounded-[2rem]">
          <img src={HERO_IMAGE} alt="Rice fields" className="absolute inset-0 h-full w-full object-cover rounded-[2rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#1c1c1a] md:to-black/60 rounded-[2rem]" />
          
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <LogoInverse />
            <ThemeToggle />
          </div>

          <div className="absolute bottom-8 left-8 max-w-sm">
            {/* Multi-Field Selector Horizontal Pill-Tabs View list row */}
            <div className="mb-4 flex flex-wrap gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/10">
              {allAvailableFields.map((field, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFieldIndex(idx)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    activeFieldIndex === idx ? "bg-emerald-500 text-white font-bold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {field.name.split(" ")}..
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Soil moisture today</p>
            <p className="font-serif text-6xl font-semibold my-1">{primaryField.soilMoisture}%</p>
            <p className="text-white/80 text-sm">Active View: {primaryField.name}</p>
            
            {primaryField.activeAlerts.length > 0 && (
              <div className="mt-4 space-y-2 max-w-xs">
                {primaryField.activeAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-2 text-xs rounded border backdrop-blur-md ${
                    alert.type === 'danger' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                  }`}>
                    <strong>⚠️ {alert.title}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & Sliders */}
        <div className="flex flex-col justify-center px-4 py-8 md:px-0">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 text-2xl">
              <Icon />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{slide.title}</h1>
              <p className="text-xl text-gray-400">{slide.subtitle}</p>
            </div>
            <p className="text-sm leading-6 text-gray-400 max-w-md">{slide.description}</p>
            
            {/* Dynamic Crop Suitability Rankings Matrix Display */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md">
              <h3 className="text-xs font-semibold text-white/70 mb-2.5 uppercase tracking-wider">💡 Suitability Match Profile</h3>
              <div className="space-y-2">
                {primaryField.cropRankings.map((crop: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm items-center border-b border-white/5 pb-1 last:border-0">
                    <span className="text-gray-300">{crop.cropName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{crop.suitabilityScore}% Match</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Simulation Panel Sliders System */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 max-w-md space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">🎛️ Active Simulator Variables</h3>
              
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Simulated Plot Title Name</label>
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
                  <input type="range" min="0" max="100" value={moisture} onChange={(e) => setMoisture(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Nitrogen Level (N)</span>
                    <span className="text-emerald-400 font-mono font-bold">{nit} ppm</span>
                  </div>
                  <input type="range" min="0" max="120" value={nit} onChange={(e) => setNit(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-emerald-500" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Welcome,
});
