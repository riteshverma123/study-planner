import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

type SessionType = "WORK" | "BREAK" | "LONG_BREAK";

export default function PomodoroPage() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionType, setSessionType] = useState<SessionType>("WORK");
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);



  const createSessionMutation = trpc.pomodoro.sessions.create.useMutation({
    onSuccess: () => {
      toast.success(`${sessionType} session completed!`);
      // Dispatch event to update dashboard stats
      window.dispatchEvent(new CustomEvent('pomodoroCompleted'));
    },
  });

  const { data: todaySessions } = trpc.pomodoro.sessions.getToday.useQuery();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Save session to database
    const duration = sessionType === "WORK" ? workDuration * 60 : sessionType === "BREAK" ? breakDuration * 60 : longBreakDuration * 60;
    createSessionMutation.mutate({
      duration,
      type: sessionType,
    });

    // Play notification sound (optional)
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==");
    audio.play().catch(() => {});

    // Move to next session
    if (sessionType === "WORK") {
      if ((sessionsCompleted + 1) % 4 === 0) {
        setSessionType("LONG_BREAK");
        setTimeLeft(longBreakDuration * 60);
      } else {
        setSessionType("BREAK");
        setTimeLeft(breakDuration * 60);
      }
    } else {
      setSessionType("WORK");
      setTimeLeft(workDuration * 60);
      setSessionsCompleted((prev) => prev + 1);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType("WORK");
    setTimeLeft(workDuration * 60);
    setSessionsCompleted(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case "WORK":
        return "from-blue-500 to-blue-600";
      case "BREAK":
        return "from-green-500 to-green-600";
      case "LONG_BREAK":
        return "from-purple-500 to-purple-600";
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case "WORK":
        return "Focus Time";
      case "BREAK":
        return "Short Break";
      case "LONG_BREAK":
        return "Long Break";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Focus on your work with the Pomodoro technique</p>
      </div>

      {/* Timer Display */}
      <Card className={`bg-gradient-to-br ${getSessionColor()} text-white overflow-hidden`}>
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-lg font-semibold mb-4 opacity-90">{getSessionLabel()}</p>
          <div className="text-7xl font-bold font-mono mb-6">{formatTime(timeLeft)}</div>
          <p className="text-sm opacity-75">Sessions completed: {sessionsCompleted}</p>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <Button onClick={toggleTimer} size="lg" className="gap-2" variant="default">
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </Button>
        <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2">
          <RotateCcw className="w-5 h-5" />
          Reset
        </Button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your Pomodoro intervals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="work">Work Duration (minutes)</Label>
              <Input
                id="work"
                type="number"
                value={workDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setWorkDuration(val);
                  if (sessionType === "WORK" && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                min="1"
                max="60"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="break">Break Duration (minutes)</Label>
              <Input
                id="break"
                type="number"
                value={breakDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setBreakDuration(val);
                  if (sessionType === "BREAK" && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                min="1"
                max="30"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label htmlFor="longBreak">Long Break Duration (minutes)</Label>
              <Input
                id="longBreak"
                type="number"
                value={longBreakDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setLongBreakDuration(val);
                  if (sessionType === "LONG_BREAK" && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                min="1"
                max="60"
                disabled={isRunning}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
            <CardDescription>Your Pomodoro sessions today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Sessions Completed</p>
              <p className="text-2xl font-bold text-accent">{todaySessions?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {todaySessions?.reduce((sum, s) => sum + Math.ceil(s.duration / 60), 0) || 0} minutes total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-900">Pomodoro Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-indigo-900 space-y-2">
          <p>• Work in focused 25-minute intervals for maximum productivity</p>
          <p>• Take short 5-minute breaks between sessions</p>
          <p>• After 4 sessions, take a longer 15-minute break</p>
          <p>• Eliminate distractions during work sessions</p>
          <p>• Track your sessions to build consistency</p>
        </CardContent>
      </Card>
    </div>
  );
}
