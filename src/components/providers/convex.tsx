import { useEffect } from "react";
import type { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/tanstack-react-start";
import { useConvexAuth, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";

export default function ConvexAppProvider({
  client,
  children,
}: {
  client: ConvexReactClient;
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      <CurrentUserSync />
      {children}
    </ConvexProviderWithClerk>
  );
}

function CurrentUserSync() {
  const { isAuthenticated } = useConvexAuth();
  const { userId } = useAuth();
  const updateCurrentUser = useMutation(api.user.updateCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    void updateCurrentUser({}).catch((error: unknown) => {
      console.error("Failed to sync the signed-in user to Convex:", error);
      toast.error("Could not sync your account. Please try again.");
    });
  }, [isAuthenticated, updateCurrentUser, userId]);

  return null;
}
