import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { PremiumAdModal } from "./PremiumAdModal";
import { Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIUnlockBannerProps {
  featureName: string; // "Chat", "Question Solver", "Marking"
}

export function AIUnlockBanner({ featureName }: AIUnlockBannerProps) {
  const { data: callLimit, refetch } = trpc.ai.checkCallLimit.useQuery();
  const watchAdMutation = trpc.ai.watchAd.useMutation();
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const canMakeCall = (callLimit?.remaining || 0) > 0 || (callLimit?.availableRewards || 0) > 0;
  const hasReachedLimit = (callLimit?.remaining || 0) === 0;

  const handleAdComplete = async () => {
    setIsWatchingAd(true);
    try {
      await watchAdMutation.mutateAsync();
      toast.success("✨ You unlocked 1 AI question! Use it wisely.", {
        description: `You can now ask 1 more question in ${featureName}`,
      });
      setShowAdModal(false);
      await refetch();
    } catch (error) {
      toast.error("Failed to process reward", {
        description: "Please try watching the ad again",
      });
    } finally {
      setIsWatchingAd(false);
    }
  };

  if (!callLimit || canMakeCall) {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">Daily Limit Reached</p>
              <p className="text-sm text-amber-700">
                You've used your 3 free AI questions for today. Watch an ad to unlock 1 more question in {featureName}.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAdModal(true)}
            disabled={isWatchingAd}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold whitespace-nowrap flex-shrink-0"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isWatchingAd ? "Processing..." : "Watch Ad"}
          </Button>
        </div>
      </Card>

      <PremiumAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        isLoading={isWatchingAd}
      />
    </>
  );
}
