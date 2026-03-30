import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobSearch from "./pages/JobSearch";
import JobDetail from "./pages/JobDetail";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import CVBuilder from "./pages/CVBuilder";
import MockInterviews from "./pages/MockInterviews";
import InterviewSession from "./pages/InterviewSession";
import Networking from "./pages/Networking";
import Messages from "./pages/Messages";
import SkillDevelopment from "./pages/SkillDevelopment";
import SavedSearches from "./pages/SavedSearches";
import RecruiterJobs from "./pages/RecruiterJobs";
import PostJob from "./pages/PostJob";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={/^\/oauth\/callback\/\w+$/} component={OAuthCallback} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/dashboard"} component={JobSeekerDashboard} />
      <Route path={"/recruiter-dashboard"} component={RecruiterDashboard} />
      <Route path={"/job-search"} component={JobSearch} />
      <Route path={"/job/:id"} component={JobDetail} />
      <Route path={"/applications"} component={Applications} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/cv-builder"} component={CVBuilder} />
      <Route path={"/mock-interviews"} component={MockInterviews} />
      <Route path={"/interview/:id"} component={InterviewSession} />
      <Route path={"/networking"} component={Networking} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/skill-development"} component={SkillDevelopment} />
      <Route path={"/saved-searches"} component={SavedSearches} />
      <Route path={"/recruiter/jobs"} component={RecruiterJobs} />
      <Route path={"/recruiter/post-job"} component={PostJob} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
