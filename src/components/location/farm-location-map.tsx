import { useEffect, useState } from "react";
import type { ComponentType } from "react";

type InteractiveFarmMapProps = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
};

export default function FarmLocationMap(props: InteractiveFarmMapProps) {
  const [InteractiveMap, setInteractiveMap] =
    useState<ComponentType<InteractiveFarmMapProps> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import("./interactive-farm-map.tsx")
      .then((module) => {
        if (active) setInteractiveMap(() => module.default);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "The interactive map could not be loaded.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loadError) {
    return (
      <p role="alert" className="p-5 text-sm text-destructive">
        Interactive map unavailable: {loadError}
      </p>
    );
  }
  if (!InteractiveMap) {
    return (
      <div className="grid h-80 place-items-center text-sm text-muted-foreground" role="status">
        Loading interactive map…
      </div>
    );
  }
  return <InteractiveMap {...props} />;
}
