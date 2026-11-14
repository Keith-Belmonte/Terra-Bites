import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/fields" as never)({
  component: FieldsOverview,
});

// Student Mock Data Array matching our API Data Contract Proposal
const MOCK_FIELDS_DATA = [
  {
    fieldId: "field-isabela-1",
    name: "Isabela Main Plot",
    location: { latitude: 16.97, longitude: 121.81, region: "Cagayan Valley" },
    currentMetrics: { soilMoisture: 65, nitrogen: 60, soilHealthIndex: 82 },
    drainageGateStatus: "automated",
    lastTelemetryFetch: "Just now",
  },
  {
    fieldId: "field-bicol-2",
    name: "Bicol Rice Plot Alpha",
    location: { latitude: 14.11, longitude: 122.95, region: "Bicol Region" },
    currentMetrics: { soilMoisture: 22, nitrogen: 35, soilHealthIndex: 45 },
    drainageGateStatus: "closed",
    lastTelemetryFetch: "5 mins ago",
  },
  {
    fieldId: "field-cagayan-3",
    name: "Cagayan Corn Plot Delta",
    location: { latitude: 18.21, longitude: 121.73, region: "Cagayan Valley" },
    currentMetrics: { soilMoisture: 45, nitrogen: 75, soilHealthIndex: 78 },
    drainageGateStatus: "open",
    lastTelemetryFetch: "12 mins ago",
  },
];

export function FieldsOverview() {
  return (
    <div className="min-h-screen bg-[#1c1c1a] text-white p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold font-mono">
              Data Core // Field Records
            </span>
            <h1 className="text-3xl font-serif font-medium mt-1">Multi-Plot Workspace Manager</h1>
          </div>
          <Link 
            to="/" 
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono tracking-wider transition-all"
          >
            ← Return to Control Terminal
          </Link>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300 leading-relaxed max-w-2xl font-mono">
          ℹ️ STUDENT DEVELOPER NOTES: Staged with contract mockup definitions. 
          Piping data structure layout before parallel merge checks with Keith.
        </div>

        {/* Fields Data Table Grid Layout */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/40 backdrop-blur-md">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs text-white/60 font-mono tracking-wider">
                <th className="p-4">Plot Identifier & Location</th>
                <th className="p-4">Soil Moisture</th>
                <th className="p-4">Nitrogen Levels</th>
                <th className="p-4">Soil Health Index (SHI)</th>
                <th className="p-4">Gate Valve</th>
                <th className="p-4 text-right">Telemetry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_FIELDS_DATA.map((field) => (
                <tr key={field.fieldId} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{field.name}</div>
                    <div className="text-xs text-white/50 font-mono mt-0.5">
                      📍 {field.location.region} ({field.location.latitude}°N, {field.location.longitude}°E)
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-mono font-bold ${field.currentMetrics.soilMoisture < 30 ? "text-red-400" : "text-emerald-400"}`}>
                      {field.currentMetrics.soilMoisture}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-gray-300">
                      {field.currentMetrics.nitrogen} ppm
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">
                        {field.currentMetrics.soilHealthIndex}/100
                      </span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-emerald-400" 
                          style={{ width: `${field.currentMetrics.soilHealthIndex}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border ${
                      field.drainageGateStatus === "open" 
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : field.drainageGateStatus === "closed"
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    }`}>
                      {field.drainageGateStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs text-white/40 font-mono">
                    {field.lastTelemetryFetch}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
