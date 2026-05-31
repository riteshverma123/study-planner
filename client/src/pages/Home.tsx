import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Flame, CheckCircle2, Clock, TrendingUp, Zap } from "lucide-react";
import { format, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { PremiumAdModal } from "@/components/PremiumAdModal";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const watchAdMutation = trpc.ai.watchAd.useMutation();
  const { refetch: refetchCallLimit } = trpc.ai.checkCallLimit.useQuery();
  
  // Fetch data for dashboard with polling for real-time updates
  const { data: upcomingTasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.getUpcoming.useQuery({ days: 7 });
  const { data: todaySessions, refetch: refetchSessions } = trpc.pomodoro.sessions.getToday.useQuery();
  const { data: streak, refetch: refetchStreak } = trpc.statistics.getStreak.useQuery();
  const { data: dailyStats, refetch: refetchDailyStats } = trpc.statistics.getDaily.useQuery({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  // Calculate statistics
  const completedTasksToday = upcomingTasks?.filter(t => t.completedAt)?.length || 0;
  const totalTodayMinutes = todaySessions?.reduce((sum, s) => sum + Math.ceil(s.duration / 60), 0) || 0;
  const completedTasksThisMonth = dailyStats?.reduce((sum, d) => sum + (d.tasksCompleted || 0), 0) || 0;

  const handleAdComplete = async () => {
    setIsWatchingAd(true);
    try {
      await watchAdMutation.mutateAsync();
      toast.success("✨ You unlocked 1 AI question!", {
        description: "You can now ask 1 more question from any AI feature",
      });
      setShowAdModal(false);
      await refetchCallLimit();
    } catch (error) {
      toast.error("Failed to process reward", {
        description: "Please try watching the ad again",
      });
    } finally {
      setIsWatchingAd(false);
    }
  };

  // Listen for task updates and refetch dashboard stats
  useEffect(() => {
    const handleTaskUpdate = () => {
      refetchTasks();
      refetchSessions();
      refetchStreak();
      refetchDailyStats();
    };

    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('pomodoroCompleted', () => {
      refetchSessions();
      refetchDailyStats();
      refetchStreak();
    });
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('pomodoroCompleted', () => {});
    };
  }, [refetchTasks, refetchSessions, refetchStreak, refetchDailyStats]);

  // Auto-refetch dashboard stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTasks();
      refetchSessions();
      refetchStreak();
      refetchDailyStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchTasks, refetchSessions, refetchStreak, refetchDailyStats]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "Student"}</h1>
        <p className="text-muted-foreground">Here's your study overview for today</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Streak */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{streak || 0}</div>
            <p className="text-xs text-orange-600/70 mt-1">consecutive days</p>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{completedTasksThisMonth}</div>
            <p className="text-xs text-emerald-600/70 mt-1">this month</p>
          </CardContent>
        </Card>

        {/* Study Time Today */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalTodayMinutes}</div>
            <p className="text-xs text-blue-600/70 mt-1">minutes today</p>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{upcomingTasks?.length || 0}</div>
            <p className="text-xs text-purple-600/70 mt-1">in next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Your tasks for {format(new Date(), "EEEE, MMMM d")}</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : upcomingTasks && upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due {format(new Date(task.dueDate), "MMM d, h:mm a")}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === "HIGH" ? "bg-red-100 text-red-700" :
                        task.priority === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/tasks">Create Task</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/pomodoro">Start Pomodoro</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/subjects">Manage Subjects</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/progress">View Progress</a>
              </Button>
              <Button 
                onClick={() => setShowAdModal(true)}
                disabled={isWatchingAd}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isWatchingAd ? "Processing..." : "Watch Ad for AI"}
              </Button>
            </CardContent>
          </Card>

          {/* Study Tip */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-sm">Study Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-900">
                Use the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. This helps maintain concentration and prevents burnout.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <PremiumAdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onAdComplete={handleAdComplete}
        isLoading={isWatchingAd}
      />
    </div>
  );
}
