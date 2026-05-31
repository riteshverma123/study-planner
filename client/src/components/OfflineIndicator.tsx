import { useOfflineMode } from "@/hooks/useOfflineMode";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const { offline, initialized } = useOfflineMode();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (initialized && offline) {
      setShow(true);
    } else {
      // Hide after 3 seconds when coming back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [offline, initialized]);

  if (!show || !initialized) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
      offline
        ? "bg-red-500/90 text-white"
        : "bg-green-500/90 text-white"
    }`}>
      {offline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline Mode - Changes saved locally</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      )}
    </div>
  );
}
