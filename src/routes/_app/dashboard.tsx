import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | TerraBites" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          TerraBites workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Your farm dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Review field conditions and explore crop guidance for your growing
          season.
        </p>
      </header>

      <section
        aria-label="Dashboard sections"
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        <Link
          to="/home"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
        >
          <span aria-hidden="true" className="text-2xl">
            🌾
          </span>
          <h2 className="mt-4 text-lg font-bold">Field overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check regional conditions, alerts, and recommended crops.
          </p>
        </Link>
        <Link
          to="/insights"
          className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary"
        >
          <span aria-hidden="true" className="text-2xl">
            📊
          </span>
          <h2 className="mt-4 text-lg font-bold">Agronomy insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore climate context and crop suitability guidance.
          </p>
        </Link>
      </section>
    </div>
  );
}
