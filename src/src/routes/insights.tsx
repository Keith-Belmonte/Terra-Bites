import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/insights" as never)({
  component: CropInsightsDashboard,
});

const MOCK_INSIGHTS_DATA = {
  primaryCropMatch: "Palay (Rice)",
  suitabilityScore: 88,
  proactiveAdvisory: {
    remediationRequired: true,
    vectorType: "nitrogen_depletion",
    recommendedActionLog: "Advising leguminous plant rotations like Munggo beans for nitrogen depletion vector remediation.",
    estimatedDaysToIntervention: 14,
  },
};

export function CropInsightsDashboard() {
  const data = MOCK_INSIGHTS_DATA;
  return (
    <div className="min-h-screen bg-[#1c1c1a] text-white p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold font-mono">
              Analytical Engine // Intelligence
            </span>
            <h1 className="text-3xl font-serif font-medium mt-1">Agronomic Insights Dashboard</h1>
          </div>
          <Link 
            to="/" 
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono tracking-wider transition-all text-emerald-400 hover:text-emerald-300"
          >
            ← Return to Control Terminal
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md space-y-2">
            <span className="text-xs font-mono text-white/50 uppercase">Optimal Variant Match</span>
            <div className="text-2xl font-bold font-serif text-emerald-400">{data.primaryCropMatch}</div>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md space-y-2">
            <span className="text-xs font-mono text-white/50 uppercase">Suitability Profile Matrix</span>
            <div className="text-2xl font-mono font-bold text-white">{data.suitabilityScore}% Rating</div>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-neutral-900/60 backdrop-blur-md space-y-2">
            <span className="text-xs font-mono text-white/50 uppercase">Action Window Vector</span>
            <div className="text-2xl font-serif text-amber-400">{data.proactiveAdvisory.estimatedDaysToIntervention} Days Remaining</div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono">
            ⚠️ Automated Crop Rotation Advisory Log
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
            {data.proactiveAdvisory.recommendedActionLog}
          </p>
          <div className="text-xs font-mono text-white/40 pt-2 border-t border-white/5">
            Vector Condition Category: <span className="underline">{data.proactiveAdvisory.vectorType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
