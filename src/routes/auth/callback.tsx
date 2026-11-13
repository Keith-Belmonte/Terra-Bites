import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({
  component: () => <Navigate to="/home" replace />,
});
