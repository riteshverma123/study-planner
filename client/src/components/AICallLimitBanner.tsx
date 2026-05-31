import { AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { PremiumAdModal } from "./PremiumAdModal";

export function AICallLimitBanner() {
  const { data: callLimit, refetch } = trpc.ai.checkCallLimit.useQuery();
  const watchAdMutation = trpc.ai.watchAd.useMutation();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const handleWatchAd = () => {
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    setIsWatchingAd(true);
    try {
      await watchAdMutation.mutateAsync();
      toast.success("🎉 Ad watched! You've unlocked 1 additional AI question.");
      refetch();
    } catch (error) {
      toast.error("Failed to process ad reward. Please try again.");
    } finally {
      setIsWatchingAd(false);
      setShowAdModal(false);
    }
  };

  if (!callLimit) return null;

  const isNearLimit = callLimit.remaining <= 1;
  const isLimitReached = callLimit.remaining === 0;

  return (
    <Card className={`p-4 border-l-4 ${
      isLimitReached 
        ? "border-l-red-500 bg-red-50/50" 
        : isNearLimit 
        ? "border-l-yellow-500 bg-yellow-50/50"
        : "border-l-blue-500 bg-blue-50/50"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className={`h-5 w-5 ${
            isLimitReached 
              ? "text-red-600" 
              : isNearLimit 
              ? "text-yellow-600"
              : "text-blue-600"
          }`} />
          <div>
            <p className="font-semibold text-sm">
              {isLimitReached 
                ? "Daily AI Limit Reached" 
                : isNearLimit 
                ? "Running Low on AI Questions"
                : "AI Questions Available"}
            </p>
            <p className="text-xs text-muted-foreground">
              {callLimit.remaining} of {callLimit.limit} questions remaining today
            </p>
          </div>
        </div>
        
        {isLimitReached && (
          <>
            <Button
              onClick={handleWatchAd}
              disabled={isWatchingAd || watchAdMutation.isPending}
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <Zap className="h-4 w-4" />
              {isWatchingAd ? "Processing..." : "Watch Ad"}
            </Button>
            <PremiumAdModal
              isOpen={showAdModal}
              onClose={() => setShowAdModal(false)}
              onAdComplete={handleAdComplete}
              isLoading={isWatchingAd}
            />
          </>
        )}
      </div>
    </Card>
  );
}

