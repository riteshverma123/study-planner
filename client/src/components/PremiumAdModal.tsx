import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX, X, Zap, Gift } from "lucide-react";

interface PremiumAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  isLoading?: boolean;
}

export function PremiumAdModal({ isOpen, onClose, onAdComplete, isLoading = false }: PremiumAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [canSkip, setCanSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      setCanSkip(false);
      setShowReward(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowReward(true);
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
      onAdComplete();
      onClose();
    } else if (canSkip) {
      onClose();
    }
  };

  const progress = ((30 - timeLeft) / 30) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">Watch Ad for AI Question</DialogTitle>
      <DialogContent className="max-w-2xl border-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-0 overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Unlock Premium Features</h2>
            <p className="text-purple-200">Watch this quick ad to get 1 free AI question</p>
          </div>

          {/* Ad Container */}
          <div className="relative w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center p-8 shadow-2xl">
            {showReward ? (
              // Reward Animation
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="text-7xl animate-bounce">🎉</div>
                <div className="space-y-2">
                  <p className="text-white text-2xl font-bold">Congratulations!</p>
                  <p className="text-white/90 text-lg">You've unlocked 1 AI Question</p>
                </div>
              </div>
            ) : (
              // Ad Content
              <div className="text-center space-y-6 w-full">
                <div className="space-y-3">
                  <div className="text-6xl">📚</div>
                  <div className="space-y-2">
                    <p className="text-white text-2xl font-bold">AI Study Assistant</p>
                    <p className="text-white/80 text-sm">Get instant answers to your study questions</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white/90 text-xs font-semibold">✨ Smart Solutions</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white/90 text-xs font-semibold">⚡ Instant Answers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white/90 text-xs font-semibold">📸 Photo Solver</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white/90 text-xs font-semibold">📊 Marking Scheme</p>
                  </div>
                </div>

                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition backdrop-blur-sm"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="space-y-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Ad Progress</span>
              <span className="text-purple-300 font-bold text-lg">{timeLeft}s</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/10" />
            <p className="text-white/60 text-xs">
              {timeLeft === 0
                ? "✅ Ad completed! Claim your reward."
                : canSkip
                ? "You can skip this ad now"
                : "Please watch the ad..."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {timeLeft === 0 ? (
              <Button
                onClick={handleSkipOrClose}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin">⏳</div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Claim Reward
                  </span>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSkipOrClose}
                  disabled={!canSkip}
                  variant="outline"
                  className="flex-1 h-12 border-white/30 text-white hover:bg-white/10 rounded-lg font-semibold"
                >
                  {canSkip ? "Skip Ad" : "Watch Ad"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 h-12 text-white hover:bg-white/10 rounded-lg font-semibold"
                >
                  Close
                </Button>
              </>
            )}
          </div>

          {/* Info Footer */}
          <div className="text-center space-y-2 pt-2 border-t border-white/10">
            <p className="text-white/70 text-sm font-medium">🎁 Reward Details</p>
            <p className="text-white/60 text-xs">
              Complete watching this ad to unlock 1 additional AI question for today. You can use it on AI Chat, Question Solver, or AI Marking.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
