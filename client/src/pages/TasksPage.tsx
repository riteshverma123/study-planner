import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function TasksPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all");
  const [formData, setFormData] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "" });

  // Fetch data
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.list.useQuery({
    completed: filter === "completed" ? true : filter === "pending" ? false : undefined,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });



  // Mutations
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
      setIsOpen(false);
      refetchTasks();
      // Dispatch event to update dashboard stats
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const toggleCompleteMutation = trpc.tasks.toggleComplete.useMutation({
    onSuccess: () => {
      toast.success("Task updated!");
      refetchTasks();
      // Dispatch event to update dashboard stats
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    },
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted!");
      refetchTasks();
      // Dispatch event to update dashboard stats
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    },
  });

  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    createTaskMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as "HIGH" | "MEDIUM" | "LOW",
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });
    // Dispatch event to update dashboard stats
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // Auto-refetch tasks every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchTasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "HIGH") return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your study tasks and deadlines</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to your study planner</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Chapter 5 exercises"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about this task..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending} className="w-full">
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="HIGH">High Priority</SelectItem>
            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
            <SelectItem value="LOW">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {tasks?.length || 0} {filter === "completed" ? "completed" : filter === "pending" ? "pending" : ""} task{tasks?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                >
                  <button
                    onClick={() => toggleCompleteMutation.mutate({ id: task.id })}
                    className="mt-1 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {task.completedAt ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completedAt ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {format(new Date(task.dueDate), "MMM d, h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTaskMutation.mutate({ id: task.id })}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "completed" ? "No completed tasks yet" : "Create your first task to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
