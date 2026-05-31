import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import SubjectsPage from "./pages/SubjectsPage";
import PomodoroPage from "./pages/PomodoroPage";
import ProgressPage from "./pages/ProgressPage";
import AIChatPage from "./pages/AIChatPage";
import QuestionSolverPage from "./pages/QuestionSolverPage";
import AIMarkingPage from "./pages/AIMarkingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { SplashScreen } from "./components/SplashScreen";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/tasks"} component={TasksPage} />
      <Route path={"/calendar"} component={CalendarPage} />
      <Route path={"/subjects"} component={SubjectsPage} />
      <Route path={"/pomodoro"} component={PomodoroPage} />
      <Route path={"/progress"} component={ProgressPage} />
      <Route path={"/ai-chat"} component={AIChatPage} />
      <Route path={"/question-solver"} component={QuestionSolverPage} />
       <Route path={"/ai-marking"} component={AIMarkingPage} />
      <Route path={"/privacy-policy"} component={PrivacyPolicyPage} />
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <SplashScreen />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
