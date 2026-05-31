import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX } from "lucide-react";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  isLoading?: boolean;
}

export function AdModal({ isOpen, onClose, onAdComplete, isLoading = false }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [isOpen]);

  const handleSkipOrClose = () => {
    if (timeLeft === 0) {
      // Only grant reward after full ad completion
      onAdComplete();
      onClose();
    } else if (canSkip) {
      // Skip button just closes the modal without reward
      onClose();
    }
  };

  const progress = ((30 - timeLeft) / 30) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Advertisement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Container */}
          <div className="relative w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">📱</div>
              <div className="text-white space-y-2">
                <p className="font-semibold text-lg">Premium Study App</p>
                <p className="text-sm opacity-90">Unlock your full potential with advanced features</p>
              </div>
            </div>

            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ad playing...</span>
              <span className="text-sm text-muted-foreground">{timeLeft}s</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {timeLeft === 0 ? (
              <Button
                onClick={handleSkipOrClose}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isLoading ? "Processing..." : "Claim Reward"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSkipOrClose}
                  variant="outline"
                  disabled={!canSkip}
                  className="flex-1"
                >
                  {canSkip ? "Skip Ad" : "Watch Ad"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            )}
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground text-center">
            Watch this ad to unlock 1 additional AI question for today
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
