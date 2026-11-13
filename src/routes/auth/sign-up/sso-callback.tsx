import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-up/sso-callback")({
  // The parent Clerk SignUp component processes the callback URL.
  component: () => null,
});
