import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import TopBar from "./components/TopBar";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import DomainsPage from "./pages/DomainsPage";
import PracticePage from "./pages/PracticePage";
import WorkspacePage from "./pages/WorkspacePage";
import EvaluationPage from "./pages/EvaluationPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  // Landing page has its own full-width layout without sidebar
  if (isLandingPage) {
    return <LandingPage />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/domains" element={<DomainsPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
