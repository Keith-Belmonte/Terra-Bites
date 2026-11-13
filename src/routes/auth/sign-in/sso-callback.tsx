import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in/sso-callback")({
  // The parent Clerk SignIn component processes the callback URL.
  component: () => null,
});
