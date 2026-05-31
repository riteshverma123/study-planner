import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Flame, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function ProgressPage() {
  // Fetch data
  const { data: dailyStats } = trpc.statistics.getDaily.useQuery({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const { data: streak } = trpc.statistics.getStreak.useQuery();

  const totalMinutesThisMonth = dailyStats?.reduce((sum, stat) => sum + (stat.totalMinutes || 0), 0) || 0;
  const totalTasksThisMonth = dailyStats?.reduce((sum, stat) => sum + (stat.tasksCompleted || 0), 0) || 0;
  const totalSessionsThisMonth = dailyStats?.reduce((sum, stat) => sum + (stat.sessionsCompleted || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">Track your study habits and achievements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Streak */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{streak || 0}</div>
            <p className="text-xs text-orange-600/70 mt-1">consecutive days</p>
          </CardContent>
        </Card>

        {/* Total Study Time */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalMinutesThisMonth}</div>
            <p className="text-xs text-blue-600/70 mt-1">minutes this month</p>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalSessionsThisMonth}</div>
            <p className="text-xs text-purple-600/70 mt-1">completed this month</p>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalTasksThisMonth}</div>
            <p className="text-xs text-emerald-600/70 mt-1">completed this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
